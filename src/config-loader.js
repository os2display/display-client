/**
 * Config loader.
 */
export default class ConfigLoader {
  static async loadConfig() {
    return fetch('/config.json')
      .then((response) => response.json())
      .catch(() => {
        // Defaults.
        return {
          authenticationEndpoint: '/api/authentication/screen',
          dataStrategy: {
            type: 'pull',
            config: {
              interval: 30000,
              endpoint: '/api',
              entryPoint: null,
            },
          },
          schedulingInterval: 60000,
          debug: true,
        };
      });
  }
}
