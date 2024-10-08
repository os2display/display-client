FROM node:20 AS APP_BUILDER
LABEL maintainer="ITK Dev <itkdev@mkb.aarhus.dk>"

ARG APP_VERSION="develop"
ARG APP_RELEASE_VERSION="develop"
ARG APP_RELEASE_TIMESTAMP=0
ENV APP_PATH=/app

ADD https://github.com/os2display/display-client/archive/${APP_VERSION}.tar.gz /tmp/app.tar
RUN mkdir -p ${APP_PATH} \
    && tar -zxf /tmp/app.tar --strip-components=1 -C ${APP_PATH} \
    && rm /tmp/app.tar

WORKDIR ${APP_PATH}

# Build it.
RUN yarn install \
    && yarn build

# Remove fixtures
RUN rm -rf public/fixtures

####
## Build main application image.
####
FROM nginxinc/nginx-unprivileged:alpine
LABEL maintainer="ITK Dev <itkdev@mkb.aarhus.dk>"

ARG APP_VERSION="develop"
ARG APP_RELEASE_VERSION="develop"
ARG APP_RELEASE_TIMESTAMP=0
ARG APP_RELEASE_TIME=0
ENV APP_PATH=/var/www/html

USER root

# Install the application.
COPY --from=APP_BUILDER /app/build ${APP_PATH}

# Copy configuration.
COPY etc /etc/

# Create release file
RUN echo "{\"releaseTimestamp\": $APP_RELEASE_TIMESTAMP, \"releaseTime\": \"$APP_RELEASE_TIME\", \"releaseVersion\": \"$APP_RELEASE_VERSION\"}" > ${APP_PATH}/release.json

# Install configuration template handler
ADD https://github.com/kelseyhightower/confd/releases/download/v0.16.0/confd-0.16.0-linux-amd64 /usr/local/bin/confd
RUN chmod +x /usr/local/bin/confd


COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh \
    && chown -R $UID:0 ${APP_PATH} \
    && chmod -R g+w ${APP_PATH}

USER $UID

WORKDIR ${APP_PATH}

EXPOSE 8080

CMD [ "/docker-entrypoint.sh", "nginx", "-g daemon off;" ]
