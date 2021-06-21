describe('Make sure book-review loads', () => {
  it('should have background-image', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-bar-select').select('bookreview1');
    cy.get('.image-blurry-background').should(
      'have.css',
      'background-image',
      'url("http://localhost:3000/fixtures/images/mountain1.jpeg")'
    );
  });

  it('should have title', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-bar-select').select('bookreview1');
    cy.get('h1')
      .first()
      .invoke('text')
      .should('match', /^Lorem Ipsum/);
  });
});
