describe('Render region', () => {
  it('Should contain Region div', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000026'
    );
    cy.get('.Region').should('not.be.empty');
  });
});
