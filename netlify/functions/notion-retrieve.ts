import { Handler } from "@netlify/functions";
import { Client } from "@notionhq/client";
import { addIndex, assoc, filter, join, map, pluck, propEq } from "ramda";

interface RetrieveHandlerRequest {
  id: string;
}

export type RichText = string;

export interface DeckData {
  setup: Setup[];
  cards: Card[];
  relationships: Relationship[];
}

export interface Setup {
  name: RichText;
  hp: number | null;
  tags: string[];
  hero_power: RichText;
  hero_incap: RichText;
  villain_setup: RichText;
  villain_effects: RichText;
}

export interface Card {
  name: RichText;
  quantity: number;
  keywords: string[];
  hp: number | null;
  effects: RichText;
  quote_text: RichText;
}

export interface Relationship {
  name: RichText;
  nemesis: boolean;
  opening_line: RichText;
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function prop(data: any, name: string): any {
  const propData = data.properties[name];
  if (propData) {
    return propData[propData.type];
  }
}

// For right now, return the plain text
// Later on we can return bold, etc. annotations
function richtext(data: any): RichText {
  return join("", pluck("plain_text")(data));
}

function tags(data: any): string[] {
  return pluck("name")(data);
}

function parseSetup(data: any) {
  const setup: Setup[] = [];

  for (let row of data) {
    setup.push({
      name: richtext(prop(row, "Name")),
      hp: prop(row, "HP"),
      tags: tags(prop(row, "Tags")),
      hero_power: richtext(prop(row, "Hero Power")),
      hero_incap: richtext(prop(row, "Hero Incap")),
      villain_setup: richtext(prop(row, "Villain Setup")),
      villain_effects: richtext(prop(row, "Villain Effects")),
    });
  }

  return setup;
}

function parseCards(data: any) {
  const cards: Card[] = [];

  for (let row of data) {
    cards.push({
      name: richtext(prop(row, "Name")),
      quantity: prop(row, "Quantity") || 1,
      keywords: tags(prop(row, "Keywords")),
      hp: prop(row, "HP"),
      effects: richtext(prop(row, "Effects")),
      quote_text: richtext(prop(row, "Quote Text")),
    });
  }

  return cards;
}

function parseRelationships(data: any): Relationship[] {
  const relationships: Relationship[] = [];

  for (let row of data) {
    relationships.push({
      name: richtext(prop(row, "Name")),
      nemesis: prop(row, "Nemesis"),
      opening_line: richtext(prop(row, "Opening Line")),
    });
  }

  return relationships;
}

/**
 * Retrieves all the blocks on a page or database and returns them
 * @param block_id the GUID of the block to retrieve
 */
async function fetchBlock(block_id: string): Promise<any> {
  let has_more: boolean = true;
  let start_cursor: string | undefined = undefined;
  let data: any = [];

  while (has_more) {
    const response: any = await notion.blocks.children.list({
      block_id,
      start_cursor,
      page_size: 50,
    });
    data = data.concat(response.results);
    start_cursor = response.next_cursor || undefined;
    has_more = response.has_more;
  }

  return data;
}

async function fetchDatabase(database_id: string): Promise<any> {
  let has_more: boolean = true;
  let start_cursor: string | undefined = undefined;
  let data: any = [];

  while (has_more) {
    const response: any = await notion.databases.query({
      database_id,
      start_cursor,
      page_size: 50,
    });
    data = data.concat(response.results);
    start_cursor = response.next_cursor || undefined;
    has_more = response.has_more;
  }

  return data;
}

const notionRetrieveHandler: Handler = async (event, _context) => {
  const body: RetrieveHandlerRequest = JSON.parse(event.body || "");

  try {
    const childBlocks = await fetchBlock(body.id);
    const childDatabases = map(
      (block: any) => ({
        id: block.id,
        title: block.child_database.title,
      }),
      filter(propEq("type", "child_database"), childBlocks)
    );

    const childData = await Promise.all(
      map(fetchDatabase, pluck("id", childDatabases))
    );
    const finalData: Record<string,any>[] = addIndex(map)(
      (child, idx, _all) => assoc("data", childData[idx], child),
      childDatabases
    );

    let setup, cards, relationships;

    for (let database of finalData) {
      switch (database.title) {
        case "Setup":
          setup = parseSetup(database.data);
          break;
        case "Cards":
          cards = parseCards(database.data);
          break;
        case "Relationships":
          relationships = parseRelationships(database.data);
          break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({setup, cards, relationships}),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};

export { notionRetrieveHandler as handler };
