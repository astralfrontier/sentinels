describe('Environment data', () => {
    it('loads the statistics page', () => {
      cy.visit('/test/challengerpark/home')
    })
  
    describe("Digital JSON", () => {
      it('loads the Digital JSON page', () => {
        cy.visit('/test/challengerpark/digital')
      })
  
      it('renders environment flavor text', () => {
        cy.visit('/test/challengerpark/digital')
        cy.get("#sentinels-tab-digital .copyable-text").should('include.text', "\"flavorText\": \"Park clean-up sucked, but Becky still{BR}took any opportunity to get out of her{BR}cell she could. And if she got time off{BR}for good behavior, all the better.\"")
      })
    })
  
    describe("Card Creator", () => {
      it('loads the Card Creator page', () => {
        cy.visit('/test/challengerpark/cc')
      })
    })
  })