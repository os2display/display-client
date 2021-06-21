describe('Render slide', () => {
  it('Should contain Slide div', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slideshow2');
    cy.get('.Slide').should('not.be.empty');
  });
});
