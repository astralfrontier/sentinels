import pascalcase from 'pascalcase';
import { concat, difference, find, head, intersection, isNil, join, map, pluck, propEq, reject, split } from "ramda";
import React from "react";

import { DeckData, Palette, RichText, Setup } from "../../netlify/functions/notion-retrieve";
import CopyableText from "./CopyableText";
import { SentinelsDataDisplayProps } from "./SentinelsData";

const CARD_CREATOR_VERSION = "107"

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

function addHeroCard(deckData: DeckData, card: Setup, defaultPalette?: Palette): string[] {
  let output: string[] = []

  const palette = find(propEq("id", card.palette), deckData.palettes) || defaultPalette

  output.push("##suppress-narrator\n")
  output.push('##hero')
  output.push(`[[name]] ${card.name}`)
  output.push(`[[hp]] ${card.hp}`)
  output.push(`[[powername]] ${card.hero_power_name}`)
  output.push(`[[power]] ${richtextEscaped(card.hero_power)}`)
  output.push(`[[art]] images\\${identifier(card.name)}A.png`)
  output.push(`[[nemesis]] blank.png`)  // TODO
  output.push(`[[artscale]] ${palette?.scaling || 'center'}`)
  output.push(`[[topcolor]] ${palette?.top_color || 'ffffff'}`)
  output.push(`[[btmcolor]] ${palette?.bottom_color || 'ffffff'}`)
  output.push(`[[boxcolor]] ${palette?.box_color || 'ffffff'}`)
  output.push(`[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}`)
  output.push('[[save]]\n')

  output.push('##hero-incap')
  output.push(`[[art]] images\\${identifier(card.name)}B.png`)

  for (let line of richtext(card.hero_incap)) {
    output.push(`{ ${line}`)
  }

  output.push(`[[artscale]] ${palette?.scaling || 'center'}`)
  output.push(`[[topcolor]] ${palette?.top_color || 'ffffff'}`)
  output.push(`[[btmcolor]] ${palette?.bottom_color || 'ffffff'}`)
  output.push(`[[boxcolor]] ${palette?.box_color || 'ffffff'}`)
  output.push(`[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}`)
  output.push(`[[save]]\n`)
 
  return output
}

function addVillainCard(deckData: DeckData, card: Setup, defaultPalette?: Palette): string[] {
  let output: string[] = []

  const palette = find(propEq("id", card.palette), deckData.palettes) || defaultPalette
  const AorB = head(intersection(['A', 'B'], card.tags))

  output.push("##suppress-narrator\n")
  output.push(`##villain`)
  output.push(`[[name]] ${card.name}`)
  output.push(`[[art]] images\\${identifier(card.name)}${AorB}.png`)
  output.push(`[[artscale]] ${palette?.scaling || 'stretched'}`)
  output.push(`[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}`)
  output.push(`[[boxcolor]] ${palette?.box_color || 'ffffff'}`)
  output.push(`[[topcolor]] ${palette?.top_color || 'ffffff'}`)
  output.push(`[[btmcolor]] ${palette?.bottom_color || 'ffffff'}`)
  output.push(`[[keywords]] ${join(', ', difference(card.tags, ['A', 'B']))}`)
  output.push(`[[hp]] ${card.hp}`)
  output.push(`[[nemesis]] blank.png`) // TODO
  output.push(`[[title]] ${card.villain_title}`)
  output.push(`[[save]]\n`)

  output.push(`##villain-setup`)
  output.push(`[[name]] ${card.name}`)
  output.push(`[[art]] images\\${identifier(card.name)}${AorB}.png`)
  output.push(`[[artscale]] ${palette?.scaling || 'stretched'}`)
  output.push(`[[footer]] ${richtextOneline(palette?.art_credit) || 'No art credit'}`)
  output.push(`[[boxcolor]] ${palette?.box_color || 'ffffff'}`)
  output.push(`[[topcolor]] ${palette?.top_color || 'ffffff'}`)
  output.push(`[[btmcolor]] ${palette?.bottom_color || 'ffffff'}`)
  output.push(`[[title]] ${card.villain_title}`)
  output.push(`[[setup]] ${richtextEscaped(card.villain_setup)}`)
  output.push(`[[gameplay]] ${richtextEscaped(card.villain_effects)}`)
  output.push(`[[advanced]] ${richtextEscaped(card.advanced)}`)
  output.push(`[[save]]\n`)

  return output
}

function addEnvironmentCard(deckData: DeckData, card: Setup, defaultPalette?: Palette): string[] {
  let output: string[] = []

  output.push('##environment')
  output.push(`[[name]] ${card.name}`)

  return output
}

function addSetupRows(deckData: DeckData, defaultPalette?: Palette): string[] {
  let output: string[] = []

  let extraOutput: string = ""

  for (let card of deckData.setup) {
    if (card.tags.includes("Hero")) {
      output = concat(output, addHeroCard(deckData, card, defaultPalette))
      extraOutput = "##hero-deck"
    } else if (card.tags.includes("Villain")) {
      output = concat(output, addVillainCard(deckData, card, defaultPalette))
      extraOutput = "##villain-deck"
    } else if (card.tags.includes("Environment")) {
      output = concat(output, addEnvironmentCard(deckData, card, defaultPalette))
    }
  }

  if (extraOutput) {
    output.push(extraOutput)
  }
  
  return output
}

function addCardRows(deckData: DeckData, defaultPalette?: Palette) {
  let output: string[] = []

  for (let card of deckData.cards) {
    const palette = find(propEq("id", card.palette), deckData.palettes) || defaultPalette

    output.push(`[[title]] ${card.name}`)
    output.push(`[[quantity]] ${card.quantity}`)
    output.push(`[[keywords]] ${card.keywords.join(', ')}`)
    output.push(`[[hp]] ${card.hp || 0}`)
    output.push(`[[text]] ${richtextEscaped(card.effects)}`)
    output.push(`[[quote]]`)
    for (let line of richtext(card.quote_text)) {
      output.push(line.replace(': "', '|"'))
    }
    output.push(`[[artpos]] ${palette?.scaling}`)
    output.push(`[[art]] images\\${identifier(card.name)}.png`)
    output.push(`[[footer]] ${richtextOneline(palette?.art_credit) || "No art credit"}`)
    output.push(`[[save]]\n`)
  }

  return output
}

function deckDataToCardBuilder(deckData: DeckData): string {
  let output: string[] = []

  const paletteId = head(reject(isNil, pluck('palette', deckData.setup)))
  const defaultPalette = find(propEq("id", paletteId), deckData.palettes)

  output.push(`##version ${CARD_CREATOR_VERSION}`)

  output = concat(output, addSetupRows(deckData, defaultPalette))
  output = concat(output, addCardRows(deckData, defaultPalette))

  return output.join('\n')
}

export default function SentinelsDataCardBuilder(props: SentinelsDataDisplayProps) {
  const jsonText = deckDataToCardBuilder(props.deckData)

  return (
    <>
      <CopyableText text={jsonText} />
    </>
  );
}
