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
          dataStrategy: {
            type: 'pull',
            config: {
              interval: 30000,
              endpoint: '/api',
              // @TODO: Remove. This should not come from config.
              entryPoint: '/v1/screens/497f6eca-6276-1596-bfeb-53ceb43a6f54',
            },
          },
          debug: true,
        };
      });
  }
}
