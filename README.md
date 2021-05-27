# DisplayClient

The display client for OS2Display ver. 2, currently a work in progress.

Currently, this is a create-react-app.

## Docker development setup

```
# Up the containers
docker-compose up -d

# Install npm packages
docker-compose run node bash -c 'npm install'

# Restart node
docker-compose restart node

# Follow the node logs to see when the code is compiled.
docker-compose logs -f node
```

The display client can opened at `http://display-client.local.itkdev.dk:3001/`.

The code is compiled when changed.

## Coding standards

For code analysis we use the [Airbnb style guide for javascript](https://github.com/airbnb/javascript) and for formatting we use [Prettier](https://github.com/prettier/prettier).

```
# Check for coding standards issues
docker-compose exec node bash -c 'npm run check-coding-standards'

# Auto-correct coding standards issues
docker-compose exec node bash -c 'npm run apply-coding-standards'
```

## Testing with cypress

We use [cypress](https://www.cypress.io/) for testing.


```
docker-compose exec node bash -c 'npm run test'
```

Or spinning up electron:

```
docker-compose exec node bash -c 'test-ui'
```

## Debug bar

The frontend has a debug bar, that allows for loading fixtures into the react app.
See the `public/fixtures` for the data fixtures.

## Build for production

Builds the app for production to the build folder.

@TODO: Add production build instructions.

## Service worker

The app makes use of  service worker to serve cached content.
When new content is added to the Client the cacheable resources are fetched and
added to the cache. After the resources have been cached the content is added to
content that should be displayed in the react app.

See `https://create-react-app.dev/docs/making-a-progressive-web-app/` for a
description of considerations regarding service workers.

This is to ensure that the content can be shown without issues and delays.

The service worker is based upon the create-react-app setup but modified to
the needs of the application.

The service worker is only enabled in production mode and when using https. To test the service
worker setup in the docker-composer setup, the assets have to be build for
production:

```
docker-compose exec node bash -c 'npm run build'
```

To test in chrome, the docker url can be set to be accepted in

```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```

Add the following

```
http://display-client.local.itkdev.dk:3002
```

Serve the production version from a different port than the regular:
```
docker-compose exec node bash -c 'node_modules/serve/bin/serve.js -s build'
```

The docker setup has been setup to expose the production version on port 3002:

```
http://display-client.local.itkdev.dk:3002/
```
