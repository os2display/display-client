describe('Make sure calendar loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000001'
    );
    cy.get('.template-calendar').should(
      'have.css',
      'background-color',
      'rgb(35, 85, 135)'
    );
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000001'
    );
    cy.get('.grid-item')
      .first()
      .invoke('text')
      .should('match', /^Calendar/);
  });
});
