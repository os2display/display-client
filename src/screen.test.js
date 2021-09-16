describe('Render screen', () => {
  it('Should contain Screen div', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000026'
    );
    cy.get('.Screen').should('not.be.empty');
  });
});
