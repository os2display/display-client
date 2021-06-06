describe('Render slide', () => {
  it('Should contain Slide div', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-1').click();
    cy.get('.Slide').should('not.be.empty');
  });
});
