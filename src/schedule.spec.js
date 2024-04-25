beforeEach(() => {
  cy.on('uncaught:exception', () => {
    return false;
  });
});

describe('Schedule tests', () => {
  it('It should load the playlist on Friday (2022-03-25)', () => {
    const friday20220325 = new Date('2022-03-25T12:30:00.000Z');

    // Sets time to a specific date, in this case 2022-03-25
    cy.clock(friday20220325);

    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 201,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 201,
      fixture: 'screen.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 201,
      fixture: 'screen-groups.json',
    }).as('groups');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 201,
      fixture: 'campaigns-empty.json',
    }).as('campaigns');
    cy.intercept('GET', '**/layouts/01FMYMAB1EQYQ40QE0C7Y6NVBK', {
      statusCode: 201,
      fixture: 'layout.json',
    }).as('layout');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYEDQKCJTVBY9ZGF57R9Q5FT/playlists',
      {
        statusCode: 201,
        fixture: 'playlist-with-schedule.json',
      }
    ).as('playlists');

    cy.intercept('GET', '**/playlists/01FYEDV33FTQVHG0K3PK7N2GXH/slides', {
      statusCode: 201,
      fixture: 'slides.json',
    }).as('slides');

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 201,
      fixture: 'templates.json',
    }).as('templates');

    cy.intercept('GET', '**/media/0007JD5AT619540YKH0J1V18C2', {
      statusCode: 201,
      fixture: 'media.json',
    }).as('media');

    cy.visit('/');
    cy.wait([
      '@bindKey',
      '@screen',
      '@groups',
      '@campaigns',
      '@layout',
      '@playlists',
      '@slides',
      '@templates',
      '@media',
    ]);

    cy.get('.slide').should('exist');
  });

  it('It should not load the playlist on Thursday (2022-03-24)', () => {
    const thursday20220324 = new Date('2022-03-24T12:30:00.000Z');

    // Sets time to a specific date, in this case 2022-03-24
    cy.clock(thursday20220324);

    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 201,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 201,
      fixture: 'screen.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 201,
      fixture: 'screen-groups.json',
    }).as('groups');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 201,
      fixture: 'campaigns-empty.json',
    }).as('campaigns');
    cy.intercept('GET', '**/layouts/01FMYMAB1EQYQ40QE0C7Y6NVBK', {
      statusCode: 201,
      fixture: 'layout.json',
    }).as('layout');

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYEDQKCJTVBY9ZGF57R9Q5FT/playlists',
      {
        statusCode: 201,
        fixture: 'playlist-with-schedule.json',
      }
    ).as('playlists');

    cy.intercept('GET', '**/playlists/01FYEDV33FTQVHG0K3PK7N2GXH/slides', {
      statusCode: 201,
      fixture: 'slides.json',
    }).as('slides');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 201,
      fixture: 'templates.json',
    }).as('templates');

    cy.intercept('GET', '**/media/0007JD5AT619540YKH0J1V18C2', {
      statusCode: 201,
      fixture: 'media.json',
    }).as('media');

    cy.visit('/');
    cy.wait([
      '@bindKey',
      '@screen',
      '@groups',
      '@campaigns',
      '@layout',
      '@playlists',
      '@slides',
      '@templates',
      '@media',
    ]);

    cy.get('.slide').should('not.exist');
  });

  it('It should not load the playlist on Friday in February (2022-02-25)', () => {
    const thursday20220225 = new Date('2022-02-25T12:30:00.000Z');

    // Sets time to a specific date, in this case 2022-02-25
    cy.clock(thursday20220225);

    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 201,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 201,
      fixture: 'screen.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 201,
      fixture: 'screen-groups.json',
    }).as('groups');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 201,
      fixture: 'campaigns-empty.json',
    }).as('campaigns');
    cy.intercept('GET', '**/layouts/01FMYMAB1EQYQ40QE0C7Y6NVBK', {
      statusCode: 201,
      fixture: 'layout.json',
    }).as('layout');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYEDQKCJTVBY9ZGF57R9Q5FT/playlists',
      {
        statusCode: 201,
        fixture: 'playlist-with-schedule.json',
      }
    ).as('playlists');

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

    cy.intercept('GET', '**/playlists/01FYEDV33FTQVHG0K3PK7N2GXH/slides', {
      statusCode: 201,
      fixture: 'slides.json',
    }).as('slides');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 201,
      fixture: 'templates.json',
    }).as('templates');

    cy.intercept('GET', '**/media/0007JD5AT619540YKH0J1V18C2', {
      statusCode: 201,
      fixture: 'media.json',
    }).as('media');

    cy.visit('/');
    cy.wait([
      '@bindKey',
      '@screen',
      '@groups',
      '@campaigns',
      '@layout',
      '@playlists',
      '@slides',
      '@templates',
      '@media',
    ]);

    cy.get('.slide').should('not.exist');
  });

  it('It should load playlist on a Monday in February (2022-02-07)', () => {
    const thursday20220207 = new Date('2022-02-07T12:30:00.000Z');

    // Sets time to a specific date, in this case 2022-02-07
    cy.clock(thursday20220207);

    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 201,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 201,
      fixture: 'screen.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 201,
      fixture: 'screen-groups.json',
    }).as('groups');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 201,
      fixture: 'campaigns-empty.json',
    }).as('campaigns');
    cy.intercept('GET', '**/layouts/01FMYMAB1EQYQ40QE0C7Y6NVBK', {
      statusCode: 201,
      fixture: 'layout.json',
    }).as('layout');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYEDQKCJTVBY9ZGF57R9Q5FT/playlists',
      {
        statusCode: 201,
        fixture: 'playlist-with-schedule.json',
      }
    ).as('playlists');

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

    cy.intercept('GET', '**/playlists/01FYEDV33FTQVHG0K3PK7N2GXH/slides', {
      statusCode: 201,
      fixture: 'slides.json',
    }).as('slides');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 201,
      fixture: 'templates.json',
    }).as('templates');

    cy.intercept('GET', '**/media/0007JD5AT619540YKH0J1V18C2', {
      statusCode: 201,
      fixture: 'media.json',
    }).as('media');

    cy.visit('/');
    cy.wait([
      '@bindKey',
      '@screen',
      '@groups',
      '@campaigns',
      '@layout',
      '@playlists',
      '@slides',
      '@templates',
      '@media',
    ]);

    cy.get('.slide').should('not.exist');
  });
});
