describe('Make sure meeting room schedule loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000019'
    );
    cy.get('.template-meeting-room-schedule').should(
      'have.css',
      'background-color',
      'rgb(210, 66, 30)'
    );
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000019'
    );
    cy.get('h1')
      .invoke('text')
      .should('match', /^Meeting room schedule 1/);
  });
});
