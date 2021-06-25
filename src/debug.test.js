describe('Make sure debug-bar loads', () => {
  it('Should display the title Debug', () => {
    cy.visit('/');
    cy.get('.debug-bar-header').contains('Debug');
  });
});

describe('Load data', () => {
  it('Should load data from fixtures', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slide: image-text top');
    cy.contains('Slide 1');
  });
});
