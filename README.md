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

