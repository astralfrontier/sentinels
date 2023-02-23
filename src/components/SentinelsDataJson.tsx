import pascalcase from 'pascalcase';
import { assoc, filter, find, join, map, partition, pluck, prop, propEq, reduce, sortBy, split, startsWith } from "ramda";

import { Card, DeckData, Relationship, RichText, RichTextBlock, Setup } from "../../netlify/functions/notion-retrieve";
import { SentinelsDataDisplayProps } from "./SentinelsData";

function identifier(input: string): string {
  return pascalcase(input.replace(/[’'"-]+/g, ''))
}

function richtextOneline(input: RichText): string {
  console.dir(input)
  const blocks = map(
    (block) => {
      let text = block.text
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

function villainCardToJson(deckData: DeckData) {
  const A = find(card => card.tags.includes("A"), deckData.setup)
  const B = find(card => card.tags.includes("B"), deckData.setup)

  if (A && B) {
    const [defaultQuote, everythingElse] = partition(propEq('name', 'default'), deckData.relationships)
    const sortedRelationships = [...defaultQuote, ...sortBy(prop('name'), everythingElse)]

    const A_palette = find(propEq("id", A.palette), deckData.palettes)
    //const B_palette = find(propEq("id", B.palette || A.palette), deckData.palettes)

    const nemesisIdentifiers = map(
      (name: string) => name.replace(/Character$/, ''),
      pluck('name', filter(relationship => relationship.nemesis, deckData.relationships) as Relationship[])
    )

    return [{
      identifier: identifier(`${A.name} Character`),
      count: 1,
      title: A.name,
      keywords: [
        "villain"
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
      openingLines: reduce(
        (lines, line: Relationship) => assoc(line.name, richtextOneline(line.opening_line), lines),
        {},
        sortedRelationships)
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
    cards: [...villainCardToJson(deckData), ...cards],
    promoCards: []
  }

  return output
}

export default function SentinelsDataJson(props: SentinelsDataDisplayProps) {
  const jsonText = JSON.stringify(deckDataToJson(props.deckData), null, 2)

  function copyToClipboard() {
    navigator.clipboard.writeText(jsonText)
    alert("Copied")
  }

  return (
    <>
      <pre>
        <button className='button is-primary is-pulled-right' onClick={copyToClipboard}>Copy</button>
        {jsonText}
      </pre>
    </>
  );
}
