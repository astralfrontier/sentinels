import { Handler } from "@netlify/functions";
import { Client } from "@notionhq/client";
import { addIndex, assoc, filter, join, map, pluck, propEq } from "ramda";

interface RetrieveHandlerRequest {
  id: string;
  access_token: string;
}

/**
 * Rich text handling:
 * 
 * RichText is an array of RichTextBlock objects.
 * Each block contains text and a list of booleans, indicating which markup applies to that block.
 * To turn rich text into plain text, concatenate all the "text" properties of the RichText array.
 * We capture more attributes (e.g. strikethrough, code, color) than Sentinels actually supports,
 * just in case.
 */

export interface RichTextBlock {
  text: string;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export type RichText = RichTextBlock[]

export interface DeckData {
  palettes: Palette[];
  setup: Setup[];
  cards: Card[];
  relationships: Relationship[];
}

export interface Palette {
  id: string;
  name: string;
  scaling: string;
  top_color: string;
  box_color: string;
  bottom_color: string;
  art_credit: RichText;
}

export interface Setup {
  name: string;
  palette?: string | undefined;
  expansion: string;
  rating: number | null;
  hp: number | null;
  tags: string[];
  icons: string[];
  hero_power_name: string;
  hero_power: RichText;
  hero_incap_icons: string[];
  hero_incap: RichText;
  villain_title: string;
  villain_setup: RichText;
  villain_effects: RichText;
  advanced: RichText;
  challenge_name: RichText;
  challenge: RichText;
}

export interface Card {
  name: string;
  palette?: string | undefined;
  quantity: number;
  keywords: string[];
  icons: string[];
  hp: number | null;
  effects: RichText;
  powers: RichText;
  quote_text: RichText;
}

export interface Relationship {
  name: string;
  nemesis: boolean;
  opening_line: RichText;
}

/**
 * Return a Notion page property by name.
 * Notion objects have a "type" property,
 * then a data property named the same as the value of "type",
 * so just return that.
 */
function prop(data: any, name: string): any {
  const propData = data.properties[name];
  if (propData) {
    return propData[propData.type];
  }
  // TODO: else throw error
}

function stripSmartQuotes(input: string): string {
  return input.replaceAll(/[‘’]/g, "'").replaceAll(/[“”]/g, '"')
}

function richtext(data: any[]): RichText {
  return map(
    (block) => ({
      text: stripSmartQuotes(block.plain_text),
      bold: block.annotations.bold,
      italic: block.annotations.italic,
      strikethrough: block.annotations.strikethrough,
      underline: block.annotations.underline,
      code: block.annotations.code,
      color: block.annotations.color
    }), data || [])
}

function plaintext(data: any): string {
  return stripSmartQuotes(join("", pluck("plain_text")(data)));
}

/**
 * Return an array of strings from a Notion select field
 * @param data 
 * @returns 
 */
function tag(data: any): string {
  return data.name
}

/**
 * Return an array of strings from a Notion multi-select field
 * @param data 
 * @returns 
 */
function tags(data: any): string[] {
  return pluck("name")(data);
}

function id(data: any): string {
  return data[0]?.id
}

function parsePalette(data: any): Palette[] {
  return map(
    row => ({
      id: row.id,
      name: plaintext(prop(row, "Name")),
      scaling: tag(prop(row, "Scaling")),
      top_color: plaintext(prop(row, "Top Color")),
      box_color: plaintext(prop(row, "Box Color")),
      bottom_color: plaintext(prop(row, "Bottom Color")),
      art_credit: richtext(prop(row, "Art Credit")),
    }),
    data
  )
}

function parseSetup(data: any): Setup[] {
  return map(
    row => ({
      name: plaintext(prop(row, "Name")),
      palette: id(prop(row, "Palette")),
      expansion: plaintext(prop(row, "Expansion")),
      rating: prop(row, "Rating"),
      hp: prop(row, "HP"),
      tags: tags(prop(row, "Tags")),
      icons: tags(prop(row, "Icons")),
      hero_power_name: plaintext(prop(row, "Hero Power Name")),
      hero_power: richtext(prop(row, "Hero Power")),
      hero_incap_icons: tags(prop(row, "Hero Incap Icons")),
      hero_incap: richtext(prop(row, "Hero Incap")),
      villain_title: plaintext(prop(row, "Villain Title")),
      villain_setup: richtext(prop(row, "Villain Setup")),
      villain_effects: richtext(prop(row, "Villain Effects")),
      advanced: richtext(prop(row, "Advanced")),
      challenge_name: richtext(prop(row, "Challenge Name")),
      challenge: richtext(prop(row, "Challenge")),
    }),
    data
  )
}

function parseCards(data: any): Card[] {
  return map(
    row => ({
      name: plaintext(prop(row, "Name")),
      palette: id(prop(row, "Palette")),
      quantity: prop(row, "Quantity") || 1,
      keywords: tags(prop(row, "Keywords")),
      icons: tags(prop(row, "Icons")),
      hp: prop(row, "HP"),
      effects: richtext(prop(row, "Effects")),
      powers: richtext(prop(row, "Powers")),
      quote_text: richtext(prop(row, "Quote Text")),
    }),
    data
  )
}

function parseRelationships(data: any): Relationship[] {
  return map(
    row => ({
      name: plaintext(prop(row, "Name")),
      nemesis: prop(row, "Nemesis"),
      opening_line: richtext(prop(row, "Opening Line")),
    }),
    data
  )
}

/**
 * Retrieves all the blocks on a page or database and returns them
 * @param block_id the GUID of the block to retrieve
 */
async function fetchBlock(notion: Client, block_id: string): Promise<any> {
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

async function fetchDatabase(notion: Client, database_id: string): Promise<any> {
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

  const notion = new Client({
    auth: body.access_token
  });

  try {
    const childBlocks = await fetchBlock(notion, body.id);
    const childDatabases = map(
      (block: any) => ({
        id: block.id,
        title: block.child_database.title,
      }),
      filter(propEq("type", "child_database"), childBlocks)
    );

    const childData = await Promise.all(
      map((id: string) => fetchDatabase(notion, id), pluck("id", childDatabases))
    );
    const finalData: Record<string,any>[] = addIndex(map)(
      (child, idx, _all) => assoc("data", childData[idx], child),
      childDatabases
    );

    let palettes, setup, cards, relationships;

    for (let database of finalData) {
      switch (database.title) {
        case "Palettes":
          palettes = parsePalette(database.data);
          break;
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

    if (!palettes || !setup || !cards || !relationships) {
      return {
        statusCode: 500,
        body: "Missing one or more databases: Palettes, Setup, Cards, Relationships"
      };  
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({palettes, setup, cards, relationships}),
      };  
    }
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};

export { notionRetrieveHandler as handler };
