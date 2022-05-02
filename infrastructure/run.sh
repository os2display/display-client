#!/bin/sh

APP_VERSION=develop
VERSION=alpha

docker build --no-cache --build-arg APP_VERSION=${APP_VERSION} APP_RELEASE_TIMESTAMP=$(date +%s) --tag=itkdev/os2display-client:${VERSION} --file="Dockerfile" .

docker push itkdev/os2display-client:${VERSION}
