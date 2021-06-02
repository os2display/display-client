/**
 * PullStrategy.
 *
 * Handles pull strategy.
 */
class PullStrategy {
  /**
   * Constructor.
   *
   * @param config
   *   The config object.
   */
  constructor(config) {
    this.initialize = this.initialize.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.fetchScreen = this.fetchScreen.bind(this);

    this.config = config;

    this.initialize();
  }

  /**
   * Initialize the strategy.
   */
  initialize() {
    this.interval = this.config?.interval ?? 5000;

    // @TODO: Validate that an endpoint has been set. Otherwise, throw an error.
    this.endpoint = this.config?.endpoint ?? '';
  }

  /**
   * Pull data from endpoint.
   */
  fetchScreen() {
    // @TODO: Cache data in indexedDB.
    // @TODO: Prefetching assets to allow service worker to cache.
    fetch(this.endpoint)
      .then((response) => response.json())
      .then((screenData) => {
        if (screenData?.regions?.length > 0) {
          screenData.regions.forEach((regionData) => {
            this.fetchRegion(regionData).then((channels) => {
              console.log(`Found channels for region: ${regionData.id}`);
              console.log(channels);

              const event = new CustomEvent('content', {
                detail: {
                  regionId: regionData.id,
                  channels
                }
              });
              document.dispatchEvent(event);
            });
          });
        }
      })
      .catch((err) => {
        console.log('Error pulling data. Retrying based on selected interval.');
        console.error(err);
      });
  }

  fetchRegion(regionData) {
    return new Promise((resolve, reject) => {
      const promises = [];

      regionData.channels.forEach((channel) => {
        promises.push(this.fetchChannel(channel.url));
      });

      Promise.all(promises)
        .then((values) => resolve(values))
        .catch((err) => reject(err));
    });
  }

  fetchChannel(channelUrl) {
    return new Promise((resolve, reject) => {
      fetch(channelUrl)
        .then((response) => response.json())
        .then((channelData) => {
          const promises = [];

          channelData.slides.forEach((slideData) => {
            promises.push(this.fetchSlide(slideData.url));
          });

          Promise.all(promises)
            .then((values) => {
              values.forEach((slide) => {
                const slideDataIndex = channelData.slides.findIndex((element) => element.id === slide.id);
                // eslint-disable-next-line no-param-reassign
                channelData.slides[slideDataIndex] = slide;
              });
              resolve(channelData);
            })
            .catch((err) => reject(err));
        })
        .catch((err) => {
          console.log('Error pulling channel.');
          reject(err);
        });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  fetchSlide(slideUrl) {
    return new Promise((resolve, reject) => {
      fetch(slideUrl)
        .then((response) => response.json())
        .then((slideData) => {
          resolve(slideData);
        })
        .catch((err) => {
          console.log('Error pulling slide.');
          reject(err);
        });
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
