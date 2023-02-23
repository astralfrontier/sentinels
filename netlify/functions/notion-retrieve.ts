import { Handler } from "@netlify/functions";
import { Client } from "@notionhq/client";
import { addIndex, assoc, filter, join, map, pluck, propEq } from "ramda";

interface RetrieveHandlerRequest {
  id: string;
}

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
  quote_text: RichText;
}

export interface Relationship {
  name: string;
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


/*
  {
    type: 'text',
    text: {
      content: 'I can recognize the dread emanations of the Shadow Veil from here. Back, damned soul.',
      link: null
    },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default'
    },
    plain_text: 'I can recognize the dread emanations of the Shadow Veil from here. Back, damned soul.',
    href: null
  }
 */
function richtext(data: any): RichText {
  return map(
    (block: any) => ({
      text: block.plain_text,
      bold: block.annotations.bold,
      italic: block.annotations.italic,
      strikethrough: block.annotations.strikethrough,
      underline: block.annotations.underline,
      code: block.annotations.code,
      color: block.annotations.color
    }), data)
}

function plaintext(data: any): string {
  return join("", pluck("plain_text")(data));
}

function tag(data: any): string {
  return data.name
}

function tags(data: any): string[] {
  return pluck("name")(data);
}

function id(data: any): string {
  return data[0]?.id
}

function parsePalette(data: any) {
  const palettes: Palette[] = [];

  for (let row of data) {
    palettes.push({
      id: row.id,
      name: plaintext(prop(row, "Name")),
      scaling: tag(prop(row, "Scaling")),
      top_color: plaintext(prop(row, "Top Color")),
      box_color: plaintext(prop(row, "Box Color")),
      bottom_color: plaintext(prop(row, "Bottom Color")),
      art_credit: richtext(prop(row, "Art Credit")),
    })
  }

  return palettes;
}

function parseSetup(data: any) {
  const setup: Setup[] = [];

  for (let row of data) {
    setup.push({
      name: plaintext(prop(row, "Name")),
      palette: id(prop(row, "Palette")),
      expansion: plaintext(prop(row, "Expansion")),
      rating: prop(row, "Rating"),
      hp: prop(row, "HP"),
      tags: tags(prop(row, "Tags")),
      icons: tags(prop(row, "Icons")),
      hero_power_name: plaintext(prop(row, "Hero Power Name")),
      hero_power: richtext(prop(row, "Hero Power")),
      hero_incap: richtext(prop(row, "Hero Incap")),
      villain_title: plaintext(prop(row, "Villain Title")),
      villain_setup: richtext(prop(row, "Villain Setup")),
      villain_effects: richtext(prop(row, "Villain Effects")),
      advanced: richtext(prop(row, "Advanced")),
      challenge_name: richtext(prop(row, "Challenge Name")),
      challenge: richtext(prop(row, "Challenge")),
    });
  }

  return setup;
}

function parseCards(data: any) {
  const cards: Card[] = [];

  for (let row of data) {
    cards.push({
      name: plaintext(prop(row, "Name")),
      palette: id(prop(row, "Palette")),
      quantity: prop(row, "Quantity") || 1,
      keywords: tags(prop(row, "Keywords")),
      icons: tags(prop(row, "Icons")),
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
      name: plaintext(prop(row, "Name")),
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

    return {
      statusCode: 200,
      body: JSON.stringify({palettes, setup, cards, relationships}),
    };
  } catch (e: any) {
    console.log(e["trace"])
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};

export { notionRetrieveHandler as handler };
