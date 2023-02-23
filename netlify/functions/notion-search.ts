import { Handler } from "@netlify/functions";
import { Client } from "@notionhq/client";

import type { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse, DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { find, map, path, pathEq, propEq, reject, values } from "ramda";

interface SearchHandlerRequest {
  query: string;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function notionResultToSearchResult(notionResult: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse): SearchResult {
  const result = notionResult as PageObjectResponse
  const titleProperty = find(propEq("type", "title"), values(result.properties))
  return {
    id: result.id,
    title: path(['title', 0, 'plain_text'], titleProperty) || "No Title",
    url: result.url
  }
}

const notionSearchHandler: Handler = async (event, _context) => {
  const body: SearchHandlerRequest = JSON.parse(event.body || '')

  let has_more: boolean = true
  let start_cursor: string | undefined = undefined
  let data: any = []

  while (has_more) {
    const response = await notion.search({
      query: body.query,
      filter: {
        value: 'page',
        property: 'object'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      start_cursor,
      page_size: 25
    })
    data = data.concat(response.results)
    start_cursor = response.next_cursor || undefined
    has_more = response.has_more
  }

  const nonDatabasePages = reject(pathEq(['parent', 'type'], 'database_id'), data)
  const final: SearchResult[] = map(notionResultToSearchResult, nonDatabasePages)

  return {
    statusCode: 200,
    body: JSON.stringify(final),
  };
};

export { notionSearchHandler as handler };
