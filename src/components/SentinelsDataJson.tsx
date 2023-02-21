import { find } from "ramda";
import React from "react";

import { Card, DeckData, Setup } from "../../netlify/functions/notion-retrieve";
import { SentinelsDataDisplayProps } from "./SentinelsData";

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

function cardsToJson(deckData: DeckData) {
  return []
}

function deckDataToJson(deckData: DeckData): any {
  const primarySetupCard = findPrimarySetupCard(deckData.setup)
  const identifier = `${primarySetupCard.name.replace(/\s+/g, '')}Character`
  const output: any = {
    name: primarySetupCard.name,
    kind: find(tag => (tag == "Hero" || tag == "Villain" || tag == "Environment"), primarySetupCard.tags),
    expansionIdentifier: "TODO",
    initialCardIdentifiers: [
      identifier
    ],
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
