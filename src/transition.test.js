describe('Make sure transition loads', () => {
  it('Should load transition', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-7').click();
    cy.get('.transition-component');
  });
});
