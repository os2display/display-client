// Only fetch new config if more than 5 minutes have passed.
const configFetchInterval = 5 * 60 * 1000;

// Defaults.
let configData = null;

// Last time the config was fetched.
let latestFetchTimestamp = 0;

let activePromise = null;

const ConfigLoader = {
  async loadConfig() {
    if (activePromise) {
      return activePromise;
    }

    activePromise = new Promise((resolve, reject) => {
      const nowTimestamp = new Date().getTime();

      if (latestFetchTimestamp + configFetchInterval >= nowTimestamp) {
        resolve(configData);
      } else {
        fetch('/client/config.json')
          .then((response) => response.json())
          .then((data) => {
            latestFetchTimestamp = nowTimestamp;
            configData = data;
            resolve(configData);
          })
          .catch((err) => {
            if (configData !== null) {
              resolve(configData);
            } else {
              // eslint-disable-next-line no-console
              console.error('Could not load config.json');
              reject(err);
            }
          })
          .finally(() => {
            activePromise = null;
          });
      }
    });

    return activePromise;
  },
};

Object.freeze(ConfigLoader);

export default ConfigLoader;
