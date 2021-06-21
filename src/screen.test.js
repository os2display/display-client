describe('Render screen', () => {
  it('Should contain Screen div', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slideshow2');
    cy.get('.Screen').should('not.be.empty');
  });
});
