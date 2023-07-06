#!/bin/sh

set -eux

APP_RELEASE_TIMESTAMP=$(date +%s)
APP_RELEASE_TIME=$(date)
APP_VERSION=develop
VERSION=alpha

docker build --pull --no-cache --build-arg APP_VERSION=${APP_VERSION} --build-arg APP_RELEASE_TIMESTAMP="${APP_RELEASE_TIMESTAMP}" --build-arg APP_RELEASE_TIME="${APP_RELEASE_TIME}" --tag=os2display/display-client:${VERSION} --file="Dockerfile" .

# docker push os2display/display-client:${VERSION}
