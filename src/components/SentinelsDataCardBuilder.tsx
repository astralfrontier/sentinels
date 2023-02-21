import React from "react";

import { Card, DeckData, Setup } from "../../netlify/functions/notion-retrieve";
import { SentinelsDataDisplayProps } from "./SentinelsData";

function addHeroCard(output: string[], card: Setup) {
  output.push('##hero')
  output.push(`[[name]] ${card.name}`)
  output.push(`[[hp]] ${card.hp}`)
  output.push(`[[powername]] ${card.hero_power}`)
  output.push(`[[power]] ${card.hero_power}`) // TODO
  output.push(`[[art]] blank.png`)  // TODO
  output.push(`[[nemesis]] blank.png`)  // TODO
  output.push(`[[artscale]] centered`)  // TODO
  output.push(`[[topcolor]] ffffff`)  // TODO
  output.push(`[[btmcolor]] bd3a3d`)  // TODO
  output.push(`[[boxcolor]] bd3a3d`)  // TODO
  output.push(`[[footer]] Art by Mike Williams`)  // TODO
  output.push('[[save]]\n')

  output.push('##hero-incap')
  output.push(`[[art]] blank.png`)
  output.push(`{ One player draws a card.`) // TODO
  output.push(`{ Destroy an ongoing card.`)
  output.push(`{ Select an environment card. It deals one target 2 fire damage.`)
  output.push(`[[boxcolor]] bd3a3d`)
  output.push(`[[footer]] Art by Mike Williams`)
  output.push(`[[save]]\n`)
}

function addVillainCard(output: string[], card: Setup) {
  // TODO
}

function addEnvironmentCard(output: string[], card: Setup) {
  // TODO
}

function addSetupRows(output: string[], setup: Setup[]) {
  let deckType = ""

  for (let card of setup) {
    if (card.tags.includes("Hero")) {
      output.push("##suppress-narrator\n")
      addHeroCard(output, card)
      deckType = "##hero-deck"
    } else if (card.tags.includes("Villain")) {
      output.push("##suppress-narrator\n")
      addVillainCard(output, card)
      deckType = "##villain-deck"
    } else if (card.tags.includes("Environment")) {
      addEnvironmentCard(output, card)
      deckType = "##hero-deck"
    }
  }
  
  if (deckType) {
    output.push(deckType)
  }
}

/**
 *  [[title]] "Hello, hero"
 *  [[quantity]] 3
 *  [[keywords]] one-shot
 *  [[text]] Select another hero.\nIf you played this card from your hand, /Charade/ deals that hero 2 irreducible psychic damage.\nThat hero's player draws a card then plays a card or uses a power.
 *  [[quote]]
 *  Jason Quill|"Alycia suddenly appearing and harshly critiquing you before disappearing again just means she's warming up to you."
 *  @Menagerie Secret Origins #16
 *  [[artpos]] centered
 *  [[art]] images\h1-7.png
 *  [[footer]] Art by Mike Williams
 *  [[save]]
 * @param output 
 * @param setup 
 */
function addCardRows(output: string[], cards: Card[]) {
  for (let card of cards) {
    output.push(`[[title]] ${card.name}`)
    output.push(`[[quantity]] ${card.quantity}`)
    output.push(`[[keywords]] ${card.keywords.join(', ')}`)
    output.push(`[[text]] ${card.effects}`)
    output.push(`[[quote]]\n${card.quote_text}`)
    output.push(`[[artpos]] centered`)  // TODO
    output.push(`[[art]] blank.png`)    // TODO
    output.push(`[[footer]] Art by TODO`) // TODO
    output.push(`[[save]]\n`)
  }
}

function deckDataToCardBuilder(deckData: DeckData): string {
  const output: string[] = []

  output.push("##version 107")

  addSetupRows(output, deckData.setup)
  addCardRows(output, deckData.cards)

  return output.join('\n')
}

export default function SentinelsDataCardBuilder(props: SentinelsDataDisplayProps) {
  return (
    <>
      <pre>{deckDataToCardBuilder(props.deckData)}</pre>
    </>
  );
}
