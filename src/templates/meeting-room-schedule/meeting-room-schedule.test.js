describe('Make sure calendar loads', () => {
  it('should load component', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('meeting-room-schedule');
    cy.get('.template-meeting-room-schedule').should('have.css', 'background-color', 'rgb(210, 66, 30)');
  });

  it('should have title', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('meeting-room-schedule');
    cy.get('h1')
      .invoke('text')
      .should('match', /^Meeting room schedule 1/);
  });
});
