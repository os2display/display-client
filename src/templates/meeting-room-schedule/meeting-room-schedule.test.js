describe('Make sure meeting room schedule loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('meeting-room-schedule');
    cy.get('.template-meeting-room-schedule').should(
      'have.css',
      'background-color',
      'rgb(210, 66, 30)'
    );
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('meeting-room-schedule');
    cy.get('h1')
      .invoke('text')
      .should('match', /^Meeting room schedule 1/);
  });
});
