# Client

This is the client that will display slides from OS2Display.
See [https://github.com/os2display/display-docs/blob/main/client.md](https://github.com/os2display/display-docs/blob/main/client.md) for more info about the client.

## Docker development setup

Start docker setup

```
# Install npm packages
docker-compose run node yarn install

# Up the containers
docker-compose up -d

# Optional: Follow the node logs to see when the code is compiled.
docker-compose logs -f node
```

The display client is here: `http://display-client.local.itkdev.dk/`.

The code is compiled when changed.

The client can be configured by creating `public/config.json` with relevant values.
See `public/example_config.json` for values.

The client should have `public/release.json` with relevant values.
See `public/example_release.json` for values.

## Coding standards

For code analysis we use the [Airbnb style guide for javascript](https://github.com/airbnb/javascript) and for formatting we use [Prettier](https://github.com/prettier/prettier).

```
# Check for coding standards issues
docker-compose exec node bash -c 'yarn check-coding-standards'

# Auto-correct coding standards issues
docker-compose exec node bash -c 'yarn apply-coding-standards'
```

## Testing with cypress

We use [cypress](https://www.cypress.io/) for testing.

To run cypress tests in the cypress container:

```
docker-compose run cypress run
```

## Build for production

Builds the app for production to the build folder.

@TODO: Add production build instructions.
