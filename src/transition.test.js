describe('Make sure transition loads', () => {
  it('Should have transition', () => {
    cy.visit('/');
    cy.get('#startDataSync').click();
    cy.get('.transition-component').should('have.css', 'animation');
  });
});
