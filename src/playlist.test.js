describe('Render playlist', () => {
  it('Should contain Playlist divs', () => {
    cy.visit('http://localhost:3000');
    cy.get('#debug-bar-fixture-1').click();
    cy.get('.Playlist').should('not.be.empty');
  });
});
