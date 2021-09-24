describe('Make sure contacts loads', () => {
  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000030'
    );
    cy.get('h1')
      .first()
      .invoke('text')
      .should('match', /^Kontakter/);
  });
});
