describe('Make sure rss loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('rssfeed');
    cy.get('.rss-slide').should(
      'have.css',
      'background-color',
      'rgb(240, 248, 255)'
    );
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('rssfeed');
    cy.get('.progress')
      .first()
      .invoke('text')
      .should('match', /^Alle nyheder/);
  });

  it('should have background image', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('rssfeed2');
    cy.get('.rss-slide')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain1.jpeg');
  });
});
