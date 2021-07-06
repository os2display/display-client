describe('Make sure sparkle loads', () => {

  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('sparkle');
    cy.get('h1')
    .invoke('text')
    .should('match', /^Lorem Ipsum/);
  });

  it('Should have background-image', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('sparkle');
    cy.get('.image')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain3.jpeg');
  });

  it('Should have video', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('sparkle with video');
    cy.get('video')
      .should('be.visible');
  });

});
