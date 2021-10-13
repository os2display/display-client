# DisplayClient

The display client for OS2Display ver. 2, currently a work in progress.

Currently, this is a create-react-app.

## Docker development setup

Get the api mock project

```
git clone https://github.com/os2display/display-api-mock.git json-server

# Install npm packages
docker-compose run json-server npm install
```

Get the templates project

```
git clone https://github.com/os2display/display-templates.git templates

# Install npm packages
docker-compose run templates npm install
```

Start docker setup

```
# Install npm packages
docker-compose run node yarn install

# Up the containers
docker-compose up -d

# Follow the node logs to see when the code is compiled.
docker-compose logs -f node
```

The display client is here: `http://display-client.local.itkdev.dk/`.

The code is compiled when changed.

The client can be configured by creating `public/config.json` with relevant values.
See `public/example_config.json` for values.

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

## Debug bar

The frontend has a debug bar, that allows for loading fixtures into the react app.
See the `public/fixtures` for the data fixtures.

## Build for production

Builds the app for production to the build folder.

@TODO: Add production build instructions.

## Event Model

![Event model](docs/EventModel.png)

## Templates

See [docs/templates.md](docs/templates.md) for information about creating templates.

Templates are loaded from outside the project with [Remote Component](https://github.com/Paciolan/remote-component).
