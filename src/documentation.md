[[toc]]

# Authorize

To use the tool, you must have a user account on [Notion](https://www.notion.so).

On the tool itself, there is an "Authorize" button in the top right corner. It will be red if you are not authorized, and blue if you are.

To start using the tool, click "Authorize".

1. If you aren't logged into Notion, it will ask you to log in
2. It will ask you to grant permission to view selected pages
3. Click "Next"
4. It will offer you a choice to use a template, or select pages
   - If you want to create a _new_ deck, choose "use a template"
   - If you want to work on _existing_ decks, choose "select pages"
5. Click "Allow access"
6. If prompted, select the pages containing decks you want to work on
7. If you chose to create a _new_ deck, it should take you to the URL for that new deck, otherwise it will take you to the search page

If you create a new deck and it gives you an error reading "Block type copy_indicator is not supported via the API", reload the page, it should work after that.

Access tokens are stored as browser cookies. Right now they're **session cookies**, so if you close out & open the browser later, you have to log in again.

# Intended Workflow

The intended use of this tool works like this:

1. Create a new Hero, Villain, or Environment deck from the [Deck Template](https://astralfrontier.notion.site/Deck-Template-7059a6378dbc4c7992fbfd3ac8ef1b60) in **Notion**.
2. Visit the [Search Page](/search) and search for the name of your deck
3. Click on "Load Data" on the matching deck to visit the URL for your specific deck
4. Fill in Cards, edit or delete Setup cards, and create Relationships in **Notion**
5. Reload the deck URL you landed on to see changes
6. Copy Digital JSON or Card Creator output into the respective tools
7. Repeat steps 4-6 until you're satisfied with the state of your deck
8. Optionally, upload the main card as cover art on the deck's Notion page!

The Notion page should be the source of truth for your deck. You should be able to share that page with other people so they can see what you're working on.

# Rich Text

Use Notion's bold, italics, and underline system where appropriate. The tool will automatically handle the marked-up text, including newlines, bold, italicized, and underlined text. It does not support Notion text colors.

# Special Cases

## Flavor Text

When writing flavor text, use this syntax:

> Character: "Quotation! **Bold** assertion! *Emphasized* word!  
> New Line! Et Cetera!"  
> Other Character: "Retort!"  
> - Big Comic Book Annual #1

Lines beginning with a single dash ("-") are considered the reference. You can include any number of spaces after the dash, but only one dash character.

Character quotations must include the quotation mark after the colon. Use only one space between the colon and the quotation mark.

## Dynamic Hit Points

Some cards have a dynamic hit point total, often shown as "*". However, the Digital tool requires a valid HP value so these cards can be targeted.

In this case, give your card in Notion a *negative HP value*. This will display HP as "*", and use the positive value as the card's default HP total.