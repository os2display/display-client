/**
 * PullStrategy.
 *
 * Handles pull strategy.
 */
class PullStrategy {
  // The endpoint where the screen can be fetched.
  endpoint = '';

  // Fetch-inteval in ms.
  interval = 5000;

  /**
   * Constructor.
   *
   * @param {object} config
   *   The config object.
   */
  constructor(config) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.fetchScreen = this.fetchScreen.bind(this);

    this.interval = config?.interval ?? 5000;
    this.endpoint = config?.endpoint ?? '';
  }

  /**
   * Fetch screen.
   */
  fetchScreen() {
    // @TODO: Cache data in indexedDB.
    // @TODO: Prefetching assets to allow service worker to cache.
    fetch(this.endpoint)
      .then((response) => response.json())
      .then((screenData) => {
        if (screenData?.regions?.length > 0) {
          const promises = [];

          screenData.regions.forEach((regionData) => {
            promises.push(this.fetchRegion(regionData));
          });

          Promise.all(promises)
            .then((values) => {
              values.forEach((region) => {
                const regionIndex = screenData.regions.findIndex((element) => element.id === region.id);
                // eslint-disable-next-line no-param-reassign
                screenData.regions[regionIndex] = region;
              });

              const event = new CustomEvent('content', {
                detail: screenData
              });
              document.dispatchEvent(event);
            })
            .catch((err) => console.error(err));
        }
      })
      .catch((err) => {
        console.log('Error pulling data. Retrying based on selected interval.');
        console.error(err);
      });
  }

  /**
   * Fetch playlists in a region of the screen.
   *
   * @param {object} regionData
   *   The data for the region.
   * @returns {Promise<object>}
   *   Promise with region with playlists attached.
   */
  fetchRegion(regionData) {
    return new Promise((resolve, reject) => {
      const promises = [];

      regionData.playlists.forEach((playlist) => {
        promises.push(this.fetchPlaylist(playlist.url));
      });

      Promise.all(promises)
        .then((values) => {
          // eslint-disable-next-line no-param-reassign
          regionData.playlists = values;
          resolve(regionData);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Fetch playlist.
   *
   * @param {string} playlistUrl
   *   The url where the playlist can be fetched.
   * @returns {Promise<object>}
   *   The promise.
   */
  fetchPlaylist(playlistUrl) {
    return new Promise((resolve, reject) => {
      fetch(playlistUrl)
        .then((response) => response.json())
        .then((playlistData) => {
          const promises = [];

          playlistData.slides.forEach((slideData) => {
            promises.push(this.fetchSlide(slideData.url));
          });

          Promise.all(promises)
            .then((values) => {
              values.forEach((slide) => {
                const slideDataIndex = playlistData.slides.findIndex((element) => element.id === slide.id);
                // eslint-disable-next-line no-param-reassign
                playlistData.slides[slideDataIndex] = slide;
              });
              resolve(playlistData);
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Fetch slide.
   *
   * @param {string} slideUrl
   *   The url where the slide can be fetched.
   * @returns {Promise<object>}
   *   The promise.
   */
  // eslint-disable-next-line class-methods-use-this
  fetchSlide(slideUrl) {
    return new Promise((resolve, reject) => {
      fetch(slideUrl)
        .then((response) => response.json())
        .then((slideData) => {
          resolve(slideData);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Start the data synchronization.
   */
  start() {
    // Pull now.
    this.fetchScreen();

    // Make sure nothing is running.
    this.stop();

    // Start interval for pull periodically.
    this.activeInterval = setInterval(this.fetchScreen, this.interval);
  }

  /**
   * Stop the data synchronization.
   */
  stop() {
    if (this.activeInterval !== undefined) {
      clearInterval(this.activeInterval);
      delete this.activeInterval;
    }
  }
}

export default PullStrategy;
