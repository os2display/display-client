describe('Make sure rss loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('rssfeed');
    cy.get('.template-rss').should(
      'have.css',
      'background-color',
      'rgb(35, 85, 135)'
    );
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('calendar1');
    cy.get('.grid-item')
      .first()
      .invoke('text')
      .should('match', /^Alle nyheder/);
  });
});
