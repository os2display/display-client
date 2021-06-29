describe('Make sure quote loads', () => {
  it('Should have class show', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('quote');
    cy.get('.template-quote').should('have.class', 'show');
  });

  it('Should have quote', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('quote');
    cy.get('.template-quote .quote').first()
    .invoke('text')
    .should('match', /^I Miss You So Much, It Hurts Sometimes./);
  });

});
