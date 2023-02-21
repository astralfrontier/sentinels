import camelCase from 'camelcase';
import { find, join, map, partition, split, startsWith } from "ramda";

import { Card, DeckData, Setup } from "../../netlify/functions/notion-retrieve";
import { SentinelsDataDisplayProps } from "./SentinelsData";

function identifier(input: string): string {
  return camelCase(input.replace(/[^a-zA-Z0-9]+/g, ''), {pascalCase: true})
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
  const output: any = {
    name: primarySetupCard.name,
    kind: find(tag => (tag == "Hero" || tag == "Villain" || tag == "Environment"), primarySetupCard.tags),
    expansionIdentifier: "TODO",
    initialCardIdentifiers: [
      cardName
    ],
    // TODO: add character card
    cards: cardsToJson(deckData),
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
