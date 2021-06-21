describe('Make sure calendar loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-select').select('calendar1');
    cy.get('.template-calendar').should('have.css', 'background-color', 'rgb(35, 85, 135)');
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-select').select('calendar1');
    cy.get('.grid-item')
      .first()
      .invoke('text')
      .should('match', /^Calendar/);
  });
});
