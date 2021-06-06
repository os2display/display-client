describe('Render screen', () => {
  it('Should contain Screen div', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-1').click();
    cy.get('.Screen').should('not.be.empty');
  });
});
