# OS2display image build

This folder contains the infrastructure files for building the `os2display/display-client` image.

## Environment variables that can be set

### config.json

* APP_API_ENDPOINT - The endpoint where the API can be called.
* APP_LOGIN_CHECK_TIMEOUT - How often (milliseconds) should the screen check for
status when it is not logged in, and waiting for being activated in the
administration.
* APP_CONFIG_FETCH_INTERVAL - How often (milliseconds) should a fresh
config.json be fetched.
* APP_REFRESH_TOKEN_TIMEOUT - How often (milliseconds) should it be checked
whether the token needs to be refreshed?
* APP_RELEASE_TIMESTAMP_INTERVAL_TIMEOUT - How often (milliseconds) should the
code check if a new release has been deployed, and reload if true?
* APP_DATA_PULL_INTERVAL - How often (milliseconds) should data be fetched for
the logged in screen?
* APP_CLIENT_LATITUDE - Where is the screen located? Used for darkmode.
* APP_CLIENT_LONGITUDE - Where is the screen located? Used for darkmode.
* APP_SCHEDULING_INTERVAL - How often (milliseconds) should scheduling for the
screen be checked.
* APP_DEBUG - Should the screen be in debug mode? If true, the cursor will be
invisible.
