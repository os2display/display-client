describe('Render region', () => {
  it('Should contain Region div', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slideshow2');
    cy.get('.Region').should('not.be.empty');
  });
});
