describe('Render region', () => {
  it('Should contain Region div', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('slideshow2');
    cy.get('.Region').should('not.be.empty');
  });
});
