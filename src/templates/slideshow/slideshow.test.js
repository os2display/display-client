describe('Make sure slideshow loads', () => {
  it('should have background-image', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-7').click();
    cy.get('.image').should(
      'have.css',
      'background-image',
      'url("http://localhost:3000/fixtures/images/mountain1.jpeg")'
    );
  });

  it('Should have right and bottom classes on logo', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-7').click();
    cy.get('.logo').should('have.class', 'bottom', 'right');
  });


  it('Should have size l class on logo', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-6').click();
    cy.get('.logo').should('have.class', 'l');
  });

});
