import pascalcase from 'pascalcase';
import { assoc, find, join, map, partition, reduce, split, startsWith } from "ramda";

import { Card, DeckData, Relationship, Setup } from "../../netlify/functions/notion-retrieve";
import { SentinelsDataDisplayProps } from "./SentinelsData";

function identifier(input: string): string {
  return pascalcase(input)
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
  const B = find(card => card.tags.includes("A"), deckData.setup)

  if (A && B) {
    return [{
      identifier: identifier(A.name),
      count: 1,
      title: A.name,
      keywords: [
        "villain"
      ],
      body: "TODO", // TODO
      backgroundColor: "8ed5e1", // TODO
      foilBackgroundColor: "8ed5e1", // TODO
      character: true,
      hitpoints: A.hp,
      nemesisIdentifiers: [], // TODO
      setup: split('\n', A.villain_setup),
      gameplay: split('\n', A.villain_effects),
      advanced: "TODO", // TODO
      icons: [], // TODO
      flippedHitpoints: B.hp,
      flippedBody: "TODO",
      flippedGameplay: split('\n', B.villain_effects),
      flippedAdvanced: "TODO",
      flippedIcons: [], // TODO
      difficulty: 2, // TODO
      challengeTitle: "TODO",
      challengeText: "TODO",
      openingLines: reduce(
        (lines, line) => assoc(line.name, line.opening_line, lines),
        {},
        deckData.relationships)
    }]
  } else {
    return []
  }
}

// TODO: parse flavor identifiers
function flavor(quote_text: string): any {
  const [flavorReferences, flavorQuotes] = partition(startsWith("@"), split("\n", quote_text))
  return {
    flavorQuotes: map(quote => ({identifier: "Unknown", text: quote}), flavorQuotes),
    flavorReference: join('', flavorReferences).substring(1)
  }
}

function cardsToJson(deckData: DeckData) {
  return map(card => {
    const { flavorQuotes, flavorReference } = flavor(card.quote_text)
    return {
      identifier: identifier(card.name),
      count: card.quantity,
      title: card.name,
      keywords: card.keywords,
      icons: [], // TODO
      body: split("\n", card.effects),
      flavorQuotes,
      flavorReference
    }
  }, deckData.cards)
}

function deckDataToJson(deckData: DeckData): any {
  const primarySetupCard = findPrimarySetupCard(deckData.setup)
  const cardName = identifier(`${primarySetupCard.name} Character`)

  const cards = cardsToJson(deckData)

  const output: any = {
    name: primarySetupCard.name,
    kind: find(tag => (tag == "Hero" || tag == "Villain" || tag == "Environment"), primarySetupCard.tags),
    expansionIdentifier: "TODO",
    initialCardIdentifiers: [
      cardName
    ],
    // TODO: add character card
    cards: [...villainCardToJson(deckData), ...cards],
    promoCards: []
  }

  return output
}

export default function SentinelsDataJson(props: SentinelsDataDisplayProps) {
  return (
    <>
      <pre>{JSON.stringify(deckDataToJson(props.deckData), null, 2)}</pre>
    </>
  );
}
