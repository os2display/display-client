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
   * @param config
   *   The config object.
   */
  constructor(config) {
    this.initialize = this.initialize.bind(this);
    this.start = this.start.bind(this);

    this.config = config.config;
    this.strategy = null;

    switch (config.type) {
      case 'pull':
      default:
        this.strategy = new PullStrategy(this.config);
    }

    this.strategy.initialize();
  }

  /**
   * Initialize the strategy.
   */
  initialize() {
    this.strategy.initialize();
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
