describe('Make sure contacts loads', () => {
  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('/v1/slides/a97f6ec4-5278-4993-bfeb-53cded000041');
    cy.get('h1')
      .first()
      .invoke('text')
      .should('match', /^Kontakter/);
  });
});
