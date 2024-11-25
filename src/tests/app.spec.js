beforeEach(() => {
  cy.on('uncaught:exception', () => {
    return false;
  });
});

describe('Client tests', () => {
  it('It loads bindkey', () => {
    cy.intercept('**/screen', {
      fixture: 'awaiting-bind-key-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
      fixture: 'config.json',
    }).as('config');

    cy.visit('/');

    // After this point we assume the config file is served from the browser
    // cache, since it the nginx setup has a 1h caching set for config.json.
    cy.wait(['@bindKey']);

    cy.get('.bind-key').should('exist');
    cy.get('.bind-key')
      .invoke('text')
      .should('match', /^26PCSL3Q/);
  });

  it('It loads an empty screen with one region', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 200,
      fixture: 'screen-empty.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 200,
      fixture: 'screen-groups-empty.json',
    }).as('groups');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 200,
      fixture: 'campaigns-empty.json',
    }).as('campaigns');

    cy.intercept('GET', '**/layouts/01FMYMAB1EQYQ40QE0C7Y6NVBK', {
      statusCode: 200,
      fixture: 'layout.json',
    }).as('layout');

    cy.visit('/');

    cy.wait(['@bindKey', '@screen', '@groups', '@campaigns', '@layout']);

    cy.get('.region').should('exist');
  });

  it('It loads a screen with a playlist and a slide', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 200,
      fixture: 'screen.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 200,
      fixture: 'screen-groups-empty.json',
    }).as('groups');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 200,
      fixture: 'campaigns-empty.json',
    }).as('campaigns');

    cy.intercept('GET', '**/layouts/01FMYMAB1EQYQ40QE0C7Y6NVBK', {
      statusCode: 200,
      fixture: 'layout.json',
    }).as('layout');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYEDQKCJTVBY9ZGF57R9Q5FT/playlists',
      {
        statusCode: 200,
        fixture: 'playlists.json',
      }
    ).as('playlists');

    cy.intercept('GET', '**/playlists/01FYEDV33FTQVHG0K3PK7N2GXH/slides', {
      statusCode: 200,
      fixture: 'slides.json',
    }).as('slides');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 200,
      fixture: 'templates.json',
    }).as('templates');

    cy.intercept('GET', '**/media/0007JD5AT619540YKH0J1V18C2', {
      statusCode: 200,
      fixture: 'media.json',
    }).as('media');

    cy.visit('/');

    cy.wait([
      '@bindKey',
      // '@config',
      '@screen',
      '@groups',
      '@campaigns',
      '@layout',
      '@playlists',
      '@slides',
      '@templates',
      '@media',
    ]);

    cy.get('.region')
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');
    cy.get('.slide').should('exist');
  });

  it('It loads a screen with a playlist and a slide, and playlist is overridden by campaign', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 200,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 200,
      fixture: 'screen.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 200,
      fixture: 'screen-groups-empty.json',
    }).as('groups');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 200,
      fixture: 'campaigns.json',
    }).as('campaigns');

    cy.intercept('GET', '**/playlists/01FYHVQEKNQ5RGQNCW497M71M6/slides', {
      statusCode: 200,
      fixture: 'campaign-slide.json',
    }).as('slides');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 200,
      fixture: 'templates.json',
    }).as('templates');

    cy.visit('/');
    cy.wait([
      '@bindKey',
      '@screen',
      '@groups',
      '@campaigns',
      '@slides',
      '@templates',
    ]);

    cy.get('.region')
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');
    cy.get('.slide').should('exist');
  });

  it('It loads a screen with a playlist and a slide, and playlist is overridden by campaign from screen group', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 201,
      fixture: 'screen.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 200,
      fixture: 'screen-groups.json',
    }).as('screen-groups');

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 200,
        fixture: 'screen-group-campaign.json',
      }
    ).as('campaigns');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 201,
      fixture: 'campaigns-empty.json',
    }).as('screen-campaigns');

    cy.intercept('GET', '**/playlists/01FYHVQEKNQ5RGQNCW497M71M6/slides', {
      statusCode: 201,
      fixture: 'campaign-slide.json',
    }).as('slides');

    cy.intercept('GET', '**/playlists/00GCCG81TJ12N11H8J0HE502ZE/slides', {
      statusCode: 201,
      fixture: 'slides-empty.json',
    }).as('slides');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 201,
      fixture: 'actual-template.json',
    }).as('templates');

    cy.visit('/');
    cy.wait([
      '@bindKey',
      '@screen',
      '@screen-groups',
      '@screen-campaigns',
      '@campaigns',
      '@slides',
      '@templates',
    ]);

    cy.get('.region')
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');
    cy.get('.slide').should('exist');
    cy.get('.slide')
      .get('h1')
      .invoke('text')
      .should('match', /^Campaign/);
  });

  it('It loads a screen, connected slide not showned because it is not published', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
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

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

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
        fixture: 'playlists.json',
      }
    ).as('playlists');

    cy.intercept('GET', '**/playlists/01FYEDV33FTQVHG0K3PK7N2GXH/slides', {
      statusCode: 201,
      fixture: 'slides-not-published.json',
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

    cy.get('.region')
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');
    cy.get('.region').should('be.empty');
  });

  it('It loads a screen, connected playlist not showned because it is not published', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
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

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

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
        fixture: 'playlist-not-published.json',
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

    cy.get('.region')
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');
    cy.get('.region').should('be.empty');
  });

  it('It loads two-part layout on screen', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
      fixture: 'config.json',
    }).as('config');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY', {
      statusCode: 201,
      fixture: 'screen-diff-layout.json',
    }).as('screen');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/screen-groups', {
      statusCode: 201,
      fixture: 'screen-groups.json',
    }).as('groups');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYHZ62T8H6QGRXPJC7RYZYNY/playlists',
      {
        statusCode: 201,
        fixture: 'playlists-empty.json',
      }
    ).as('slides');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYHZ62T7DXZ0YBM57NCYSX5E/playlists',
      {
        statusCode: 201,
        fixture: 'playlists-empty.json',
      }
    ).as('slides');

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

    cy.intercept('GET', '**/screens/01FYEDW1N133SG516JVJ3VG5FY/campaigns', {
      statusCode: 201,
      fixture: 'campaigns-empty.json',
    }).as('campaigns');

    cy.intercept('GET', '**/layouts/01FMYMBPSJQ7SG7BZZ1N8TB7GW', {
      statusCode: 201,
      fixture: 'layout-split.json',
    }).as('layout');

    cy.visit('/');
    cy.wait(['@bindKey', '@screen', '@layout']);

    cy.get('.region')
      .eq(0)
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');
    cy.get('.region')
      .eq(1)
      .should('have.css', 'grid-area')
      .and('eq', 'b / b / b / b');
  });

  it('It loads a template', () => {
    cy.intercept('POST', '**/screen', {
      statusCode: 201,
      fixture: 'screen-response.json',
    }).as('bindKey');

    cy.intercept('GET', '**/config.json', {
      statusCode: 200,
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

    cy.intercept(
      'GET',
      '**/screen-groups/01AGD290CV12PM1H3N0B2X0TTM/campaigns',
      {
        statusCode: 201,
        fixture: 'campaigns-empty.json',
      }
    ).as('campaigns');

    cy.intercept('GET', '**/layouts/01FMYMAB1EQYQ40QE0C7Y6NVBK', {
      statusCode: 201,
      fixture: 'layout.json',
    }).as('layout');

    cy.intercept(
      'GET',
      '**/screens/01FYEDW1N133SG516JVJ3VG5FY/regions/01FYEDQKCJTVBY9ZGF57R9Q5FT/playlists',
      {
        statusCode: 201,
        fixture: 'playlists.json',
      }
    ).as('playlists');

    cy.intercept('GET', '**/playlists/01FYEDV33FTQVHG0K3PK7N2GXH/slides', {
      statusCode: 201,
      fixture: 'slides.json',
    }).as('slides');

    cy.intercept('GET', '**/templates/01FP2SNGFN0BZQH03KCBXHKYHG', {
      statusCode: 201,
      fixture: 'actual-template.json',
    }).as('templates');

    cy.intercept('GET', '**/media/0007JD5AT619540YKH0J1V18C2', {
      statusCode: 201,
      fixture: 'media.json',
    }).as('media');

    cy.intercept(
      'GET',
      'https://raw.githubusercontent.com/os2display/display-templates/develop/build/image-text.js'
    ).as('image-text');

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
      '@image-text',
    ]);

    cy.get('.region')
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');

    cy.get('.region')
      .should('have.css', 'grid-area')
      .and('eq', 'a / a / a / a');
    cy.get('.slide').should('exist');
    cy.get('.slide')
      .get('h1')
      .invoke('text')
      .should('match', /^Tekst overskrift/);
  });
});
