describe('Make sure text-box loads', () => {
  it('Should have headline, text and background-image', () => {
    cy.visit('/');
    cy.get('#startDataSync').click();
    cy.get('.transition-component')
      .should('have.css', 'animation')
      .and('include', '0.5s ease 0s 1 normal none running fadeIn');
  });
});
