import pascalcase from 'pascalcase';
import { difference, find, flatten, head, intersection, isNil, join, map, pluck, propEq, reject, split } from "ramda";
import React from "react";

import { Card, DeckData, Palette, RichText, Setup } from "../../netlify/functions/notion-retrieve";
import CopyableText from "./CopyableText";
import { SentinelsDataDisplayProps } from "./SentinelsData";

const PREAMBLE = "##version 107"

function identifier(input: string): string {
  return pascalcase(input.replace(/[’'"-]+/g, ''))
}

function richtextOneline(input: RichText | undefined): string {
  if (!input) {
    return ""
  }

  const blocks = map(
    (block) => {
      let text = block.text
      if (block.italic) {
        text = `/${text}/`
      }
      if (block.bold) {
        text = `!${text}!`
      }
      if (block.underline) {
        text = `_${text}_`
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

function richtextEscaped(input: RichText): string {
  return richtextOneline(input).replaceAll('\n', '\\n')
}

function cardQuote(quote_text: RichText): string {
  const remappedLines = map(
    line => line.replace(': "', '|"'),
    richtext(quote_text)
  )
  return join('\n', remappedLines)
}

function cardToOutput(deckData: DeckData, card: Card, defaultPalette?: Palette): string {
  const palette = find(propEq("id", card.palette), deckData.palettes) || defaultPalette

  return `
[[title]] ${card.name}
[[quantity]] ${card.quantity}
[[keywords]] ${card.keywords.join(', ')}
[[hp]] ${card.hp || 0}
[[text]] ${richtextEscaped(card.effects)}
[[quote]]
${cardQuote(card.quote_text)}
[[artpos]] ${palette?.scaling}
[[art]] images\\${identifier(card.name)}.png
[[footer]] ${richtextOneline(palette?.art_credit) || "No art credit"}
[[save]]
`
}

function cardsToOutput(deckData: DeckData, defaultPalette?: Palette): string {
  const cardOutput = map(
    card => cardToOutput(deckData, card, defaultPalette),
    deckData.cards
  )
  return join('', cardOutput)
}

function heroCardIncap(hero_incap: RichText): string {
  const remappedLines = map(
    line => `{ ${line}`,
    richtext(hero_incap)
  )
  return join('\n', remappedLines)
}

function heroCard(deckData: DeckData, card: Setup, defaultPalette?: Palette): string {
  const palette = find(propEq("id", card.palette), deckData.palettes) || defaultPalette

  return `##hero
[[name]] ${card.name}
[[hp]] ${card.hp}
[[powername]] ${card.hero_power_name}
[[power]] ${richtextEscaped(card.hero_power)}
[[art]] images\\${identifier(card.name)}A.png
[[nemesis]] blank.png
[[artscale]] ${palette?.scaling || 'center'}
[[topcolor]] ${palette?.top_color || 'ffffff'}
[[btmcolor]] ${palette?.bottom_color || 'ffffff'}
[[boxcolor]] ${palette?.box_color || 'ffffff'}
[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}
[[save]]

##hero-incap
[[art]] images\\${identifier(card.name)}B.png
${heroCardIncap(card.hero_incap)}
[[artscale]] ${palette?.scaling || 'center'}
[[topcolor]] ${palette?.top_color || 'ffffff'}
[[btmcolor]] ${palette?.bottom_color || 'ffffff'}
[[boxcolor]] ${palette?.box_color || 'ffffff'}
[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}
[[save]]
`
}

function heroDeck(deckData: DeckData, defaultPalette?: Palette): string {
  return `${PREAMBLE}
##suppress-narrator

${join('\n', map(card => heroCard(deckData, card, defaultPalette), deckData.setup))}

##hero-deck
${cardsToOutput(deckData, defaultPalette)}
`
}

function villainCard(deckData: DeckData, card: Setup, defaultPalette?: Palette): string {
  const palette = find(propEq("id", card.palette), deckData.palettes) || defaultPalette
  const AorB = head(intersection(['A', 'B'], card.tags))

  return `##villain
[[name]] ${card.name}
[[art]] images\\${identifier(card.name)}${AorB}.png
[[artscale]] ${palette?.scaling || 'stretched'}
[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}
[[boxcolor]] ${palette?.box_color || 'ffffff'}
[[topcolor]] ${palette?.top_color || 'ffffff'}
[[btmcolor]] ${palette?.bottom_color || 'ffffff'}
[[keywords]] ${join(', ', difference(card.tags, ['A', 'B']))}
[[hp]] ${card.hp}
[[nemesis]] blank.png
[[title]] ${card.villain_title}
[[save]]

##villain-setup
[[name]] ${card.name}
[[art]] images\\${identifier(card.name)}${AorB}.png
[[artscale]] ${palette?.scaling || 'stretched'}
[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}
[[boxcolor]] ${palette?.box_color || 'ffffff'}
[[topcolor]] ${palette?.top_color || 'ffffff'}
[[btmcolor]] ${palette?.bottom_color || 'ffffff'}
[[title]] ${card.villain_title}
[[setup]] ${richtextEscaped(card.villain_setup)}
[[gameplay]] ${richtextEscaped(card.villain_effects)}
[[advanced]] ${richtextEscaped(card.advanced)}
[[save]]
`
}

function villainDeck(deckData: DeckData, defaultPalette?: Palette): string {
  return `${PREAMBLE}
##suppress-narrator

${join('\n', map(card => villainCard(deckData, card, defaultPalette), deckData.setup))}
##villain-deck
${cardsToOutput(deckData, defaultPalette)}
`
}

function environmentDeck(deckData: DeckData, defaultPalette?: Palette): string {
  return `${PREAMBLE}
##environment
${join('\n', map(card => `[[name]] ${card.name}`, deckData.setup))}
${cardsToOutput(deckData, defaultPalette)}

` 
}

function deckDataToCardBuilder(deckData: DeckData): string {
  const paletteId = head(reject(isNil, pluck('palette', deckData.setup)))
  const defaultPalette = find(propEq("id", paletteId), deckData.palettes)

  // Will contain one of "Hero", "Villain", or "Environment"
  const deckType = find(tag => ["Hero", "Villain", "Environment"].includes(tag), flatten(pluck("tags", deckData.setup)))

  switch(deckType) {
    case "Hero":
      return heroDeck(deckData, defaultPalette)
    case "Villain":
      return villainDeck(deckData, defaultPalette)
    case "Environment":
      return environmentDeck(deckData, defaultPalette)
    default:
      return "ERROR: no Hero, Villain, or Environment Setup detected"
  }
}

export default function SentinelsDataCardBuilder(props: SentinelsDataDisplayProps) {
  const jsonText = deckDataToCardBuilder(props.deckData)

  return (
    <>
      <CopyableText text={jsonText} />
    </>
  );
}
