/**
 * DataSync.
 *
 * Handles data synchronization.
 */
class DataSync {
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

    this.config = config.config;
    this.strategy = config.type ?? 'pull';

    this.initialize();
  }

  /**
   * Initialize the strategy.
   */
  initialize() {
    if (this.strategy === 'pull') {
      this.interval = this.config?.interval ?? 5000;
      this.endpoint = this.config?.endpoint ?? '';
    }
  }

  /**
   * Pull data from endpoint.
   */
  pull() {
    // @TODO: Fetch with ID of screen.
    // @TODO: Handle fetching screen,channels,slides and assemble array.
    // @TODO: Cache data in indexedDB.
    fetch(this.endpoint)
      .then((response) => response.json())
      .then((slideData) => {
        const event = new CustomEvent('content', {
          detail: slideData
        });
        document.dispatchEvent(event);
      });
  }

  /**
   * Start the data synchronization.
   */
  start() {
    if (this.strategy === 'pull') {
      setInterval(this.pull, this.interval);
    }
  }
}

export default DataSync;
