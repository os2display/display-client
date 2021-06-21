describe('Simple app loads', () => {
  it('localhost and simple text', () => {
    cy.visit('/');
    cy.get('.App').should('be.empty');
  });
});
