# Client

This is the client that will display slides from OS2Display.
See [https://github.com/os2display/display-docs/blob/main/client.md](https://github.com/os2display/display-docs/blob/main/client.md) for more info about the client.

## Config
The client can be configured by creating `public/config.json` with relevant values.
See `public/example_config.json` for example values.

Values explained:

* apiEndpoint - The endpoint where the API is located.
* loginCheckTimeout - How often (milliseconds) should the screen check for
status when it is not logged in, and waiting for being activated in the
administration.
* configFetchInterval - How often (milliseconds) should a fresh
config.json be fetched.
* refreshTokenTimeout - How often (milliseconds) should it be checked
whether the token needs to be refreshed?
* releaseTimestampIntervalTimeout - How often (milliseconds) should the
code check if a new release has been deployed, and reload if true?
* dataStrategy.config.interval - How often (milliseconds) should data be fetched
for the logged in screen?
* colorScheme.lat - Where is the screen located? Used for darkmode.
* colorScheme.lng - Where is the screen located? Used for darkmode.
* schedulingInterval - How often (milliseconds) should scheduling for the
screen be checked.
* debug - Should the screen be in debug mode? If true, the cursor will be
invisible.

All endpoint should be configured without a trailing slash. The endpoints `apiEndpoint` can be
left empty if the api is hosted from the root of the same domain as the client. E.g. if the api is at https://example.org and the client is at
https://example.org/client

## Preview

The client can be started in preview mode by setting the following url parameters:
```
preview=<screen|playlist|slide>
preview-id=<id of entity to preview>
preview-token=<token for accessing data>
preview-tenant=<tenant id>
```

The preview will use the token and tenant for acessing the data from the api.

## Docker development setup

Start docker setup

```
# Install npm packages
docker compose run --rm node yarn install

# Up the containers
docker compose up -d

# Optional: Follow the node logs to see when the code is compiled.
docker compose logs -f node
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
docker compose exec node bash -c 'yarn check-coding-standards'

# Auto-correct coding standards issues
docker compose exec node bash -c 'yarn apply-coding-standards'
```

## Testing with cypress

We use [cypress](https://www.cypress.io/) for testing.

To run cypress tests in the cypress container:

```
docker compose run cypress run
```

## Build for production

Github actions will build both docker images published to [docker hub](https://hub.docker.com/repository/docker/os2display/display-client/general) and release assets published as [github releases](https://github.com/os2display/display-client/releases). To run the display client choose which option suits you and download it.

If you wish to do your own production build, you need to do
```shell
docker compose run node yarn install
docker compose run node yarn build

# Make release file. Replace 'x.y.z' with relevant release version
printf "{\n  \"releaseTimestamp\": $(date +%s),\n  \"releaseTime\": \"$(date)\",\n  \"releaseVersion\": \"x.y.z\"\n}" > build/release.json

# Make config file
cp public/example_config.json build/config.json
```

This will build the client configured to be hosted at `/client`. If you wish to host at a different path
you need to edit `homepage` in `package.json` and re-build.

For instructions on how to host a complete OS2display setup please see the [docs](https://os2display.github.io/display-docs/).
