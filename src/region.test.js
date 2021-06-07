describe('Render region', () => {
  it('Should contain Region div', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-1').click();
    cy.get('.Region').should('not.be.empty');
  });
});
