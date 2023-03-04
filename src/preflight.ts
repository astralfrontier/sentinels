import { flatten, intersection, join, pluck, split } from "ramda";

import { DeckData, RichText } from "../netlify/functions/notion-retrieve";

type WarnFunction = (cardName: string, warning: string) => void

function plaintext(input: RichText): string {
  return join('', pluck('text', input))
}

function checkMixedDecks(deckData: DeckData, warn: WarnFunction): void {
  const tags = flatten(pluck("tags", deckData.setup))
  const mainTags = intersection(['Hero', 'Villain', 'Environment'], tags)
  if (mainTags.length > 1) {
    warn("DECK", `Setup can only have one type of card, found ${join(', ', mainTags)}`)
  }
  if (tags.includes("Villain")) {
    if (!tags.includes("A") || !tags.includes("B")) {
      warn("DECK", "Villain decks need both A and B Setup cards")
    }
  }
}

function checkTooManyPowers(deckData: DeckData, warn: WarnFunction): void {
  for (let card of deckData.cards) {
    const powerText = split('\n', plaintext(card.powers))
    if (powerText.length > 2) {
      warn(card.name, `Card has ${powerText.length} powers, recommended 2 or less`)
    }
  }
}

export default function preflightWarnings(deckData: DeckData): string[] {
  const preflightFunctions = [
    checkMixedDecks,
    checkTooManyPowers
  ]

  const warnings: string[] = []
  const warn: WarnFunction = (cardName, warning) => warnings.push(`${cardName}: ${warning}`)

  for (let fn of preflightFunctions) {
    fn(deckData, warn)
  }

  return warnings
}
