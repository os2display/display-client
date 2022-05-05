/**
 * Config loader.
 */
export default class ConfigLoader {
  static async loadConfig() {
    return fetch('/client/config.json')
      .then((response) => response.json())
      .catch((err) => {
        /* eslint-disable-next-line no-console */
        console.error('Could not find config.json. Returning defaults.', err);

        return {
          authenticationEndpoint: '/api/authentication/screen',
          authenticationRefreshTokenEndpoint:
            '/api/authentication/token/refresh',
          dataStrategy: {
            type: 'pull',
            config: {
              interval: 30000,
              endpoint: '/api',
            },
          },
          colorScheme: {
            type: 'library',
            lat: 56.0,
            lng: 10.0,
          },
          fallbackImage: './assets/fallback.png',
          tenantFallbackImages: {},
          schedulingInterval: 60000,
          debug: false,
        };
      });
  }
}
