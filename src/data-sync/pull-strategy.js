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
    this.pull = this.pull.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

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
  pull() {
    // @TODO: Fetch with ID of screen.
    // @TODO: Handle fetching screen,channels,slides and assemble array.
    // @TODO: Cache data in indexedDB.
    // @TODO: Prefetching assets to allow service worker to cache.
    fetch(this.endpoint)
      .then((response) => response.json())
      .then((slideData) => {
        const event = new CustomEvent('content', {
          detail: slideData
        });
        document.dispatchEvent(event);
      })
      .catch((err) => {
        console.log('Error pulling data. Retrying based on selected interval.');
        console.error(err);
      });
  }

  /**
   * Start the data synchronization.
   */
  start() {
    // Pull now.
    this.pull();

    // Make sure nothing is running.
    this.stop();

    // Start interval for pull periodically.
    this.activeInterval = setInterval(this.pull, this.interval);
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
