import PullStrategy from './pull-strategy';

/**
 * DataSync.
 *
 * Handles data synchronization.
 */
class DataSync {
  /**
   * Constructor.
   *
   * @param {object} config
   *   The config object.
   */
  constructor(config) {
    this.start = this.start.bind(this);

    this.config = config.config;
    this.strategy = null;

    switch (config.type) {
      case 'pull':
      default:
        this.strategy = new PullStrategy(this.config);
    }
  }

  /**
   * Start the data synchronization.
   */
  start() {
    this.strategy.start();
  }

  /**
   * Stop the data synchronization.
   */
  stop() {
    this.strategy.stop();
  }
}

export default DataSync;
