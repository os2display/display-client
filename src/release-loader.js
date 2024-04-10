/**
 * Release loader.
 */
export default class ReleaseLoader {
  static async loadConfig() {
    return fetch('/client/release.json')
      .then((response) => response.json())
      .catch((err) => {
        /* eslint-disable-next-line no-console */
        console.error('Could not find release.json. Returning defaults.', err);

        return {
          releaseTimestamp: null,
          releaseVersion: null,
        };
      });
  }
}
