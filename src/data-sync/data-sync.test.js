describe('Setup data sync', () => {
  it('should start loading data when fixture is selected', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000002'
    );
    cy.contains('Slide 1');
  });
});
