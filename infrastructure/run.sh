#!/bin/sh

set +x
set +e

APP_RELEASE_TIMESTAMP=$(date +%s)
APP_VERSION=develop
VERSION=alpha

docker build --no-cache --build-arg APP_VERSION=${APP_VERSION} --build-arg APP_RELEASE_TIMESTAMP=${APP_RELEASE_TIMESTAMP} --tag=itkdev/os2display-client:${VERSION} --file="Dockerfile" .

docker push itkdev/os2display-client:${VERSION}
