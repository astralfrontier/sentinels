import pascalcase from "pascalcase";
import { head, reject } from "ramda";

import { Setup } from "../netlify/functions/notion-retrieve";

/**
 * Turn a card name, e.g. "Foo Bar" into a pascal-cased slug, e.g. "FooBar"
 * @param input a card name or other string
 * @returns a pascal-cased slug
 */
export function identifier(input: string): string {
  return pascalcase(input.replace(/['"-]+/g, ""));
}

/**
 * Since Setup can have multiple entries, e.g. Villain A and Villain B,
 * find the card that represents the main character or environment
 * @param setup all setup cards in the deck
 * @returns the primary setup card
 */
export function findPrimarySetupCard(setup: Setup[]): Setup {
  const primaryCards = reject(
    (card: Setup) => card.tags.includes("Hero Variant") || card.tags.includes("B"),
    setup
  )
  return head(primaryCards) || setup[0]
}