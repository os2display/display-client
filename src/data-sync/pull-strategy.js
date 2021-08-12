import cloneDeep from 'lodash.clonedeep';
import Logger from '../logger/logger';

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
          const newScreenData = cloneDeep(screenData);
          const promises = [];

          newScreenData.regions.forEach((regionData) => {
            promises.push(this.fetchRegion(regionData));
          });

          Promise.allSettled(promises)
            .then((results) => {
              results.forEach((result) => {
                if (result.status === 'fulfilled') {
                  const region = result.value;
                  const regionIndex = newScreenData.regions.findIndex(
                    (element) => element.id === region.id
                  );
                  newScreenData.regions[regionIndex] = region;
                }
              });

              const event = new CustomEvent('content', {
                detail: {
                  screen: newScreenData,
                },
              });
              document.dispatchEvent(event);
            })
            .catch((err) => Logger.log('error', err));
        }
      })
      .catch((err) => {
        Logger.log(
          'info',
          'Error pulling data. Retrying based on selected interval.'
        );
        Logger.log('error', err);
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
      const newRegionData = cloneDeep(regionData);

      newRegionData.playlists.forEach((playlist) => {
        promises.push(this.fetchPlaylist(playlist.url));
      });

      Promise.allSettled(promises)
        .then((results) => {
          newRegionData.playlists = results.map((result) => {
            if (result.status === 'fulfilled') {
              return result.value;
            }
            return null;
          });
          resolve(newRegionData);
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
          const newPlaylistData = cloneDeep(playlistData);

          newPlaylistData.slides.forEach((slideData) => {
            promises.push(this.fetchSlide(slideData.url));
          });

          Promise.allSettled(promises)
            .then((results) => {
              results.forEach((result) => {
                if (result.status === 'fulfilled') {
                  const slide = result.value;
                  const slideDataIndex = newPlaylistData.slides.findIndex(
                    (element) => element.id === slide.id
                  );
                  newPlaylistData.slides[slideDataIndex] = slide;
                }
              });
              resolve(newPlaylistData);
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
