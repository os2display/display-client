describe('Make sure text-box loads', () => {
  it('Should have headline, text and background-image', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('slide: text-box top');
    cy.get('.template-text-box .box .headline').contains('Slide 1');
    cy.get('.template-text-box .box .text').contains('Lorem ipsum');
    cy.get('.template-text-box').should(
      'have.css',
      'background-image',
      'url("http://localhost:3000/fixtures/images/mountain1.jpeg")'
    );
  });

  it('Should have flex-direction set when boxAlign is left', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('slide: text-box left');
    cy.get('.template-text-box').should('have.css', 'flex-direction', 'column');
  });

  it('Should have flex-direction, align-self set when boxAlign is right', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('slide: text-box right');
    cy.get('.template-text-box').should('have.css', 'flex-direction', 'column');
    cy.get('.template-text-box .box').should('have.css', 'align-self', 'flex-end');
  });

  it('Should have align-self set when boxAlign is bottom', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('slide: text-box bottom');
    cy.get('.template-text-box .box').should('have.css', 'align-self', 'flex-end');
  });

  it('Should have colors set', () => {
    cy.visit('http://localhost:3000');
    cy.get('.debug-select').select('slide: text-box colors');
    cy.get('.template-text-box').should('have.css', 'background-color', 'rgb(255, 0, 0)');
    cy.get('.template-text-box .box').should('have.css', 'background-color', 'rgb(0, 255, 0)');
    cy.get('.template-text-box .box').should('have.css', 'color', 'rgb(0, 0, 255)');
  });
});
