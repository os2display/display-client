# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- [#109](https://github.com/os2display/display-client/pull/109)
  Change docker image name from `os2display/os2display-client` to `os2display/display-client` to match image name and repository name

## [1.2.6] - 2023-06-12

- [#105](https://github.com/os2display/display-client/pull/105)
  Update docker build to publish to "os2display" org on docker hup.
  Update github workflow to latest actions.
  Add github workflow to build and create release.
  Change `example_config.json` to use relative paths.

## [1.2.5] - 2023-06-06

- [#104](https://github.com/os2display/display-client/pull/104)
  Changed error boundary page to show error.

## [1.2.4] - 2023-05-25

- [#103](https://github.com/os2display/display-client/pull/103)
  Update PullStrategy to handle pagination.

## [1.2.3] - 2023-03-24

- [#101](https://github.com/os2display/display-client/pull/101)
  Added notranslate google meta.
- [#100](https://github.com/os2display/display-client/pull/100)
  Handling issue where slides were not starting after region had been empty.
- [#99](https://github.com/os2display/display-client/pull/99)
  Changed config loader to avoid competing fetches.
  Changed logic concerning when fallback image should be shown.
  Removed throwing of exception on getPath when response.ok not okay.

## [1.2.2] - 2023-03-07

- [#98](https://github.com/os2display/display-client/pull/98)
  Removed possible multiple ContentService instantiations.
  Fixed checkScheduling interval being registered multiple times.
  Added :8080 to cypress baseUrl.

## [1.2.1] - 2023-01-13

- [#97](https://github.com/os2display/display-client/pull/97)
  Changed port in vhost and change from npm start to yarn start.

## [1.2.0] - 2023-01-05

- [#96](https://github.com/os2display/display-client/pull/96)
  Added changelog.
  Added github action to enforce that PRs should always include an update of the
  changelog.
- [#95](https://github.com/os2display/display-client/pull/95)
  Updated docker setup to match new itkdev base setup.
- [#94](https://github.com/os2display/display-client/pull/94)
  Update grid generator from 1.0.6 -> 1.0.8.

## [1.1.0] - 2022-10-06

- [#93](https://github.com/os2display/display-client/pull/93)
  Updated react from 17 to 18.
  Changed the rendering in index.js
  Moved some dependencies to dev-dependencies
- [#92](https://github.com/os2display/display-client/pull/92)
  Added scaling for 4k screens for touch buttons in touch-region.

## [1.0.2] - 2022-09-08

- [#91](https://github.com/os2display/display-client/pull/91)
  Theme logo fetch.

## [1.0.1] - 2022-06-01

- [#90](https://github.com/os2display/display-client/pull/90)
  Changed class names to lower case.

## [1.0.0] - 2022-05-18

- First release.
