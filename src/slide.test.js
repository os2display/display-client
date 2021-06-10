describe('Render slide', () => {
  it('Should contain Slide div', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('slideshow2');
    cy.get('.Slide').should('not.be.empty');
  });
});
