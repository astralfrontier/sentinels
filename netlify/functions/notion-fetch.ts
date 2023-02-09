import { Handler } from "@netlify/functions";
import { Client } from "@notionhq/client";
import { filter, map, propEq } from "ramda";

interface FetchHandlerRequest {
  id: string;
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const notionFetchHandler: Handler = async (event, _context) => {
  const body: FetchHandlerRequest = JSON.parse(event.body || '')

  let has_more: boolean = true
  let start_cursor: string | undefined = undefined
  let data: any = []

  while (has_more) {
    const response = await notion.blocks.children.list({
      block_id: body.id,
      start_cursor,
      page_size: 25
    })
    data = data.concat(response.results)
    start_cursor = response.next_cursor || undefined
    has_more = response.has_more
  }

  const childDatabases = map(
    (block: any) => ({
      id: block.id,
      title: block.child_database.title
    }),
    filter(propEq("type", "child_database"), data)
  )

  return {
    statusCode: 200,
    body: JSON.stringify(childDatabases),
  };
};

export { notionFetchHandler as handler };
