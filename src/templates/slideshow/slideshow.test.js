describe('Make sure slideshow loads', () => {
  it('should have background-image', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slideshow2');
    cy.get('.image')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain1.jpeg');
  });

  it('Should have right and bottom classes on logo', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slideshow2');
    cy.get('.logo').should('have.class', 'bottom', 'right');
  });

  it('Should have size l class on logo', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slideshow1');
    cy.get('.logo').should('have.class', 'l');
  });
});
