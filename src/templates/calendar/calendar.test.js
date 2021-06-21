describe('Make sure calendar loads', () => {
  it('should load component', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-bar-select').select('calendar1');
    cy.get('.template-calendar').should('have.css', 'background-color', 'rgb(35, 85, 135)');
  });

  it('should have title', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-bar-select').select('calendar1');
    cy.get('.grid-item')
      .first()
      .invoke('text')
      .should('match', /^Calendar 1/);
  });
});
