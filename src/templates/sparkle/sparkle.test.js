describe('Make sure sparkle loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000027'
    );
    cy.get('h1')
      .invoke('text')
      .should('match', /^Lorem Ipsum/);
  });

  it('Should have background-image', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000027'
    );
    cy.get('.image')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain3.jpeg');
  });

  it('Should have video', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000029'
    );
    cy.get('video').should('be.visible');
  });
});
