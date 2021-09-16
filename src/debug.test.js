describe('Make sure debug-bar loads', () => {
  it('Should display the title Debug', () => {
    cy.visit('/');
    cy.get('.debug-bar-header').contains('Debug');
  });
});

describe('Load data', () => {
  it('Should load data from fixtures', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000003'
    );
    cy.contains('Slide 2');
  });
});
