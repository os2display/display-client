describe('Make sure image-text loads', () => {
  it('Should have headline, text and background-image', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000002'
    );
    cy.get('.template-image-text .box h1').contains('Slide 1');
    cy.get('.template-image-text .box .text').contains('Lorem ipsum');
    cy.get('.template-image-text')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain1.jpeg');
  });

  it('Should have flex-direction set when boxAlign is left', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000003'
    );
    cy.get('.template-image-text').should(
      'have.css',
      'flex-direction',
      'column'
    );
  });

  it('Should have flex-direction, align-self set when boxAlign is right', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000004'
    );
    cy.get('.template-image-text').should(
      'have.css',
      'flex-direction',
      'column'
    );
    cy.get('.template-image-text .box').should(
      'have.css',
      'align-self',
      'flex-end'
    );
  });

  it('Should have align-self set when boxAlign is bottom', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000005'
    );
    cy.get('.template-image-text .box').should(
      'have.css',
      'align-self',
      'flex-end'
    );
  });

  it('Should have colors set', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000006'
    );
    cy.get('.template-image-text').should(
      'have.css',
      'background-color',
      'rgb(255, 0, 0)'
    );
    cy.get('.template-image-text .box').should(
      'have.css',
      'background-color',
      'rgb(0, 255, 0)'
    );
    cy.get('.template-image-text .box').should(
      'have.css',
      'color',
      'rgb(0, 0, 255)'
    );
  });

  it('Should have fontsize s set', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000007'
    );
    cy.get('.template-image-text .box').should('have.css', 'font-size', '10px');
  });

  it('Should have fontsize m set', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000008'
    );
    cy.get('.template-image-text .box').should('have.css', 'font-size', '15px');
  });

  it('Should have fontsize l set', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000009'
    );
    cy.get('.template-image-text .box').should('have.css', 'font-size', '20px');
  });

  it('Should have fontsize xl set', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000010'
    );
    cy.get('.template-image-text .box').should('have.css', 'font-size', '25px');
  });

  it('Should have animated separator', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000011'
    );
    cy.get('.template-image-text .box .separator').should(
      'have.css',
      'animation'
    );
  });

  it('Should have margin', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000011'
    );
    cy.get('.template-image-text').should('have.class', 'box-margin');
  });

  it('Should have half size', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000011'
    );
    cy.get('.template-image-text').should('have.class', 'half-size');
  });

  it('Should be reversed', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000012'
    );
    cy.get('.template-image-text').should('have.class', 'reversed');
    cy.get('.template-image-text').should('not.have.class', 'half-size');
    cy.get('.template-image-text').should('not.have.class', 'animated-header');
    cy.get('.template-image-text').should('have.class', 'box-margin');
    cy.get('.template-image-text .text').should('have.css', 'order', '1');
    cy.get('.template-image-text h1').should('have.css', 'order', '2');
  });

  it('Should have just image', () => {
    cy.visit('/');
    cy.get('.debug-bar-select').select(
      '/v1/screens/497f6eca-6276-1596-bfeb-53ceb4000013'
    );
    cy.get('.template-image-text')
      .should('have.css', 'background-image')
      .and('include', '/fixtures/images/mountain4.jpeg');
  });
});
