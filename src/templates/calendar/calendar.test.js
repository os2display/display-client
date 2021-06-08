describe('Make sure calendar loads', () => {
  it('should load component', () => {
    cy.visit('http://localhost:3000');
    cy.get('select').select('calendar1');
    cy.get('.template-calendar').should(
      'have.css',
      'background-color',
      'rgb(35, 85, 135)'
    );
  });
});
