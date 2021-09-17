describe('Make sure quote loads', () => {
  it('Should have class show', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000022'
    );
    cy.get('.template-quote').should('have.class', 'show');
  });

  it('Should have quote', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000022'
    );
    cy.get('.template-quote .quote')
      .first()
      .invoke('text')
      .should('match', /^I Miss You So Much, It Hurts Sometimes./);
  });
});
