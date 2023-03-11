describe('Hero data', () => {
  it('loads the statistics page', () => {
    cy.visit('/test/mercury/home')
  })

  describe("Digital JSON", () => {
    it('loads the Digital JSON page', () => {
      cy.visit('/test/mercury/digital')
    })

    it('contains the proper flavor reference', () => {
      cy.visit('/test/mercury/digital')
      cy.get("#sentinels-tab-digital .copyable-text").should('include.text', "\"flavorReference\": \"A10, The Menagerie #39\"")
    })

    it('includes promo identifiers', () => {
      cy.visit('/test/mercury/digital')
      cy.get("#sentinels-tab-digital .copyable-text").should('include.text', "\"promoIdentifier\": \"FourthOfJulyMercuryCharacter\"")
    })
  })

  describe("Card Creator", () => {
    it('loads the Card Creator page', () => {
      cy.visit('/test/mercury/cc')
    })
  
    it('renders powers properly', () => {
      cy.visit('/test/mercury/cc')
      cy.get("#sentinels-tab-cc .copyable-text").should('include.text', "[[text]] !Power: !>Select a target. Until the start of your next turn, reduce damage dealt by that target to /Mercury/ by 1.<")
    })

    it('renders rich text properly', () => {
      cy.visit('/test/mercury/cc')
      cy.get("#sentinels-tab-cc .copyable-text").should('include.text', "[[text]] Whenever damage dealt by a villain target is redirected to /Mercury/, /Mercury/ regains 1 HP.\\nOnce per turn, when a villain target would deal damage to another hero target, you may redirect that damage to /Mercury/.")
    })
  })
})