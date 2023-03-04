import pascalcase from 'pascalcase';
import { assoc, difference, filter, find, join, map, partition, pluck, prop, propEq, reduce, sortBy, split, startsWith } from "ramda";

import { DeckData, Relationship, RichText, Setup } from "../../netlify/functions/notion-retrieve";
import CopyableText from './CopyableText';
import { SentinelsDataDisplayProps } from "./SentinelsData";

function identifier(input: string): string {
  return pascalcase(input.replace(/['"-]+/g, ''))
}

function richtextOneline(input: RichText): string {
  const blocks = map(
    (block) => {
      let text = block.text.replaceAll('[H]', '{H}')
      if (block.italic) {
        text = `[i]${text}[/i]`
      }
      if (block.bold) {
        text = `[b]${text}[/b]`
      }
      if (block.underline) {
        text = `[u]${text}[/u]`
      }
      return text
    },
    input
  )

  return join('', blocks)
}

function richtext(input: RichText): string[] {
  return split('\n', richtextOneline(input))
}

function findPrimarySetupCard(setup: Setup[]): Setup {
  for (let card of setup) {
    if (card.tags.includes("Hero")) {
      return card;
    } else if (card.tags.includes("Villain") && card.tags.includes("A")) {
      return card;
    } else if (card.tags.includes("Environment")) {
      return card;
    }
  }
  return setup[0]
}

function relationships(deckData: DeckData) {
  const [defaultQuote, everythingElse] = partition(propEq('name', 'default'), deckData.relationships)
  const sortedRelationships = [...defaultQuote, ...sortBy(prop('name'), everythingElse)]

  const nemesisIdentifiers = map(
    (name: string) => name.replace(/Character$/, ''),
    pluck('name', filter(relationship => relationship.nemesis, deckData.relationships) as Relationship[])
  )

  const openingLines = reduce(
    (lines, line: Relationship) => assoc(line.name, richtextOneline(line.opening_line), lines),
    {},
    sortedRelationships)

  return {openingLines, nemesisIdentifiers}
}

function heroCardToJson(deckData: DeckData) {
  const hero = find(card => card.tags.includes("Hero"), deckData.setup)

  if (hero) {
    const {openingLines, nemesisIdentifiers} = relationships(deckData)

    const palette = find(propEq("id", hero.palette), deckData.palettes)

    return [{
      identifier: identifier(`${hero.name} Character`),
      count: 1,
      title: hero.name,
      body: hero.hero_power_name,
      backgroundColor: palette?.box_color  || "ffffff",
      foilBackgroundColor: palette?.box_color || "ffffff",
      hitpointsColor: palette?.bottom_color || "ffffff",
      character: true,
      powers: richtext(hero.hero_power),
      icons: hero.icons,
      hitpoints: hero.hp,
      nemesisIdentifiers,
      incapacitatedAbilities: richtext(hero.hero_incap),
      flippedIcons: hero.hero_incap_icons,
      openingLines,
      complexity: hero.rating
    }]
  } else {
    return []
  }
}

function villainCardToJson(deckData: DeckData) {
  const A = find(card => card.tags.includes("A"), deckData.setup)
  const B = find(card => card.tags.includes("B"), deckData.setup)

  if (A && B) {
    const {openingLines, nemesisIdentifiers} = relationships(deckData)

    const A_palette = find(propEq("id", A.palette), deckData.palettes)
    //const B_palette = find(propEq("id", B.palette || A.palette), deckData.palettes)

    return [{
      identifier: identifier(`${A.name} Character`),
      count: 1,
      title: A.name,
      keywords: [
        "villain", ...difference(['Villain', 'A'], A.tags)
      ],
      body: A.villain_title,
      backgroundColor: A_palette?.box_color  || "ffffff",
      foilBackgroundColor: A_palette?.box_color || "ffffff",
      character: true,
      hitpoints: A.hp,
      nemesisIdentifiers,
      setup: richtext(A.villain_setup),
      gameplay: richtext(A.villain_effects),
      advanced: richtextOneline(A.advanced),
      icons: A.icons,
      flippedHitpoints: B.hp,
      flippedBody: B.villain_title,
      flippedGameplay: richtext(B.villain_effects),
      flippedAdvanced: richtextOneline(B.advanced),
      flippedIcons: B.icons,
      difficulty: A.rating,
      challengeTitle: richtextOneline(A.challenge_name),
      challengeText: richtextOneline(A.challenge),
      openingLines
    }]
  } else {
    return []
  }
}

function environmentCardToJson(deckData: DeckData) {
  const env = find(card => card.tags.includes("Environment"), deckData.setup)

  if (env) {
    const palette = find(propEq("id", env.palette), deckData.palettes)

    return [{
      name: env.name,
      kind: "Environment",
      expansionIdentifier: env.expansion,
      backgroundColor: palette?.box_color  || "ffffff",
      difficulty: env.rating,
      shortName: identifier(`${env.name}`),
    }]
  } else {
    return []
  }
}

function flavor(quote_text: RichText) {
  let identifier = {}
  let buffer: string[] = []
  let flavorQuotes: any[] = []
  let flavorReference = {}
  let i

  let text = richtext(quote_text)
  for (let line of text) {
    if (startsWith("@", line)) {
      flavorReference = {flavorReference: line.substring(1)}
    } else if ((i = line.indexOf(": ")) > -1) {
      // We found a new identifier, push any existing buffer
      if (buffer.length > 0) {
        flavorQuotes.push({
          ...identifier,
          text: join('{BR}', buffer)
        })
        buffer = []
      }
      identifier = {identifier: line.substring(0, i)}
      buffer.push(line.substring(i + 2).replaceAll(/^\"|\"$/g, ""))
    } else {
      buffer.push(line.replaceAll(/^\"|\"$/g, ""))
    }
  }

  if (buffer.length > 0) {
    flavorQuotes.push({
      ...identifier,
      text: join('{BR}', buffer)
    })
  }

  if ("flavorReference" in flavorReference && flavorQuotes.length == 1 && "identifier" in flavorQuotes[0]) {
    flavorReference = {
      flavorReference: `${flavorQuotes[0].identifier}, ${flavorReference.flavorReference}`
    }
  }

  return {
    flavorQuotes,
    ...flavorReference
  }
}

function cardsToJson(deckData: DeckData, defaultPalette: string | undefined) {
  return map(card => {
    const cardFlavor = flavor(card.quote_text)
    //const paletteId = card.palette || defaultPalette
    //const palette = find(propEq("id", paletteId), deckData.palettes)
    const hp = card.hp ? {hitpoints: card.hp} : {}

    return {
      identifier: identifier(card.name),
      count: card.quantity,
      title: card.name,
      keywords: card.keywords,
      icons: card.icons,
      body: richtext(card.effects),
      ...cardFlavor,
      ...hp
    }
  }, deckData.cards)
}

function deckDataToJson(deckData: DeckData): any {
  const primarySetupCard = findPrimarySetupCard(deckData.setup)
  const defaultPalette = primarySetupCard.palette
  const cardName = identifier(`${primarySetupCard.name} Character`)

  const cards = cardsToJson(deckData, defaultPalette)

  const output: any = {
    name: primarySetupCard.name,
    kind: find(tag => (tag == "Hero" || tag == "Villain" || tag == "Environment"), primarySetupCard.tags),
    expansionIdentifier: primarySetupCard.expansion,
    initialCardIdentifiers: [
      cardName
    ],
    cards: [
      ...heroCardToJson(deckData),
      ...villainCardToJson(deckData),
      ...environmentCardToJson(deckData),
      ...sortBy(prop('identifier'), cards)
    ],
    promoCards: []
  }

  return output
}

export default function SentinelsDataJson(props: SentinelsDataDisplayProps) {
  const jsonText = JSON.stringify(deckDataToJson(props.deckData), null, 2)

  return (
    <>
      <CopyableText text={jsonText} />
    </>
  );
}
