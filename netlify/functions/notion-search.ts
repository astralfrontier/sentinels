import { Client } from "@notionhq/client";

import { Handler } from "@netlify/functions";
import type { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse, DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { find, propEq, values } from "ramda";

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
    title: titleProperty?.title[0].plain_text || "No Title",
    url: result.url
  }
}

const notionSearchHandler: Handler = async (event, _context) => {
  const body: SearchHandlerRequest = JSON.parse(event.body || '')

  const response = await notion.search({
    query: body.query,
    filter: {
      value: 'page',
      property: 'object'
    },
    sort: {
      direction: 'descending',
      timestamp: 'last_edited_time'
    }
  })

  const one = response.results[0]

  const data: SearchResult[] = response.results.map(notionResultToSearchResult)

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

export { notionSearchHandler as handler };
