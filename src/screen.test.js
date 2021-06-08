describe('Render screen', () => {
  it('Should contain Screen div', () => {
    cy.visit('http://localhost:3000');
    cy.get('select').select('slideshow2');
    cy.get('.Screen').should('not.be.empty');
  });
});
