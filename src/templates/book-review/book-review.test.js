describe('Make sure book-review loads', () => {
  it('should have background-image', () => {
    cy.visit('/');
    cy.get('.debug-select').select('bookreview1');
    cy.get('.image-blurry-background')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain1.jpeg');
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-select').select('bookreview1');
    cy.get('h1')
      .first()
      .invoke('text')
      .should('match', /^Lorem Ipsum/);
  });
});
