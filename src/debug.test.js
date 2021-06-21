describe('Make sure debug-bar loads', () => {
  it('Should display the title Debug', () => {
    cy.visit('/');
    cy.get('.debug-bar-header').contains('Debug');
  });
});

describe('Load data', () => {
  it('Should load data from fixtures', () => {
    cy.visit('/');
    cy.get('.debug-select').select('slide: text-box top');
    cy.contains('Slide 1');
  });
});
