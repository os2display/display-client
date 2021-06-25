describe('Make sure image-text loads', () => {
  it('Should have headline, text and background-image', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slide: image-text top');
    cy.get('.template-image-text .box .headline').contains('Slide 1');
    cy.get('.template-image-text .box .text').contains('Lorem ipsum');
    cy.get('.template-image-text')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain1.jpeg');
  });

  it('Should have flex-direction set when boxAlign is left', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slide: image-text left');
    cy.get('.template-image-text').should('have.css', 'flex-direction', 'column');
  });

  it('Should have flex-direction, align-self set when boxAlign is right', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slide: image-text right');
    cy.get('.template-image-text').should('have.css', 'flex-direction', 'column');
    cy.get('.template-image-text .box').should('have.css', 'align-self', 'flex-end');
  });

  it('Should have align-self set when boxAlign is bottom', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slide: image-text bottom');
    cy.get('.template-image-text .box').should('have.css', 'align-self', 'flex-end');
  });

  it('Should have colors set', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select('slide: image-text colors');
    cy.get('.template-image-text').should('have.css', 'background-color', 'rgb(255, 0, 0)');
    cy.get('.template-image-text .box').should('have.css', 'background-color', 'rgb(0, 255, 0)');
    cy.get('.template-image-text .box').should('have.css', 'color', 'rgb(0, 0, 255)');
  });
});
