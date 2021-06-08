describe('Render playlist', () => {
  it('Should contain Playlist divs', () => {
    cy.visit('http://localhost:3000');
    cy.get('select').select('slideshow2');
    cy.get('.Playlist').should('not.be.empty');
  });
});
