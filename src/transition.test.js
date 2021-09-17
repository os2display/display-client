describe('Make sure transition loads', () => {
  it('Should have transition', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb43a6f54'
    );
    cy.get('.transition-component').should('have.css', 'animation');
  });
});
