/**
 * Release loader.
 */
export default class ReleaseLoader {
  static async loadConfig() {
    const nowTimestamp = new Date().getTime();
    return fetch(`/release.json?ts=${nowTimestamp}`)
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
