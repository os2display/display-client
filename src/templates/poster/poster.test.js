describe('Make sure poster loads', () => {
  it('should load component', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('poster');
    cy.get('.template-poster .image-area').should(
      'have.css',
      'background-image',
      'url("http://nginx/fixtures/images/mountain1.jpeg")'
    );
  });

  it('should have title', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('poster');
    cy.get('.header-area .center h1')
      .first()
      .invoke('text')
      .should('match', /^Havnerundfart med MS TUNØ/);
  });

  it('should have date', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('poster');
    cy.get('.info-area .date')
      .first()
      .invoke('text')
      .should('match', /^Mandag d. 21. juni 2021 kl. 14:00/);
  });
  it('should have dates', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('poster with 2 events');
    cy.get('.info-area .date')
      .first()
      .invoke('text')
      .should('match', /^Mandag d. 21. juni 2021 kl. 14:00 - Tirsdag d. 22. juni 2021 kl. 15:00/);
  });
});
