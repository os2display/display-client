// Only fetch new config if more than 15 minutes have passed.
import appStorage from "./app-storage.js";

const configFetchIntervalDefault = 15 * 60 * 1000;

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

    activePromise = new Promise((resolve) => {
      const nowTimestamp = new Date().getTime();

      if (
        latestFetchTimestamp +
          (configData?.configFetchInterval ?? configFetchIntervalDefault) >=
        nowTimestamp
      ) {
        resolve(configData);
      } else {
        fetch(`/client/config.json?ts=${nowTimestamp}`)
          .then((response) => response.json())
          .then((data) => {
            latestFetchTimestamp = nowTimestamp;
            configData = data;

            // Make api endpoint available through localstorage.
            appStorage.setApiUrl(configData.apiEndpoint);
            appStorage.setDebug(configData.debug ?? false);

            resolve(configData);
          })
          .catch(() => {
            if (configData !== null) {
              resolve(configData);
            } else {
              // eslint-disable-next-line no-console
              console.error(
                'Could not load config.json. Will use default config.'
              );

              // Default config.
              resolve({
                apiEndpoint: '/api',
                dataStrategy: {
                  type: 'pull',
                  config: {
                    interval: 30000,
                  },
                },
                loginCheckTimeout: 20000,
                configFetchInterval: 900000,
                refreshTokenTimeout: 15000,
                releaseTimestampIntervalTimeout: 600000,
                colorScheme: {
                  type: 'library',
                  lat: 56.0,
                  lng: 10.0,
                },
                schedulingInterval: 60000,
                debug: false,
              });
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
