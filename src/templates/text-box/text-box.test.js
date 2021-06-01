describe('Make sure text-box loads', () => {
  it('Should display the title Debug', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-1').click();
    cy.contains('Slide 1');
  });
});
