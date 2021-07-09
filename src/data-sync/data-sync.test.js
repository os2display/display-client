describe('Setup data sync', () => {
  it('should start loading data when startDataSync event is triggered', () => {
    cy.visit('/');
    cy.get('#startDataSync').click();
    cy.contains('Header');
    cy.contains('Footer');
  });
});
