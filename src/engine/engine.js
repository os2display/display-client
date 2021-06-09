import cloneDeep from 'lodash.clonedeep';
import Logger from '../logger/logger';
import DataSync from '../data-sync/data-sync';

/**
 * Engine.
 */
class Engine {
  dataSync;

  data;

  /**
   * Constructor.
   */
  constructor() {
    this.startSyncing = this.startSyncing.bind(this);
    this.stopSyncHandler = this.stopSyncHandler.bind(this);
    this.startDataSyncHandler = this.startDataSyncHandler.bind(this);
    this.regionReadyHandler = this.regionReadyHandler.bind(this);
    this.contentHandler = this.contentHandler.bind(this);
    this.start = this.start.bind(this);
  }

  /**
   * Start data synchronization.
   */
  startSyncing() {
    Logger.log('info', 'Starting data synchronization');

    // Fetch config and launch data synchronization.
    fetch('./config.json')
      .then((response) => response.json())
      .then((config) => {
        this.dataSync = new DataSync(config.dataStrategy);
        this.dataSync.start();
      })
      .catch((err) => {
        Logger.log('info', 'Error staring data synchronization');
        Logger.log('error', err);

        // Retry starting synchronization after 1 min.
        setTimeout(this.startSyncing, 60 * 1000);
      });
  }

  /**
   * Stop sync event handler.
   */
  stopSyncHandler() {
    Logger.log('info', 'Event received: Stop data synchronization');
    if (this.dataSync) {
      Logger.log('info', 'Stopping data synchronization');
      this.dataSync.stop();
      this.dataSync = null;
    }
  }

  /**
   * Start data event handler.
   */
  startDataSyncHandler() {
    Logger.log('info', 'Event received: Start data synchronization');
    if (!this.dataSync) {
      this.startSyncing();
    }
  }

  /**
   * New content event handler.
   *
   * @param {CustomEvent} event
   *   The event.
   */
  contentHandler(event) {
    Logger.log('info', 'Event received: content');

    const data = event.detail;
    this.data = data.screen;

    Engine.emitScreen(this.data);
  }

  /**
   * Region ready handler.
   *
   * @param {CustomEvent} event
   *   The event.
   */
  regionReadyHandler(event) {
    const data = event.detail;
    const regionId = data.id;

    Logger.log('info', `Event received: regionReady for ${regionId}`);

    if (this.data?.regions?.length > 0) {
      const foundRegions = this.data.regions.filter((region) => region.id === regionId);
      foundRegions.forEach((region) => {
        Engine.emitRegion(region);
      });
    }
  }

  /**
   * Start the engine.
   */
  start() {
    Logger.log('info', 'Engine started.');

    document.addEventListener('stopDataSync', this.stopSyncHandler);
    document.addEventListener('startDataSync', this.startDataSyncHandler);
    document.addEventListener('content', this.contentHandler);
    document.addEventListener('regionReady', this.regionReadyHandler);
  }

  /**
   * Stop the engine.
   */
  stop() {
    Logger.log('info', 'Engine stopped.');

    document.removeEventListener('stopDataSync', this.stopSyncHandler);
    document.removeEventListener('startDataSync', this.startDataSyncHandler);
    document.removeEventListener('content', this.contentHandler);
    document.removeEventListener('regionReady', this.regionReadyHandler);
  }

  /**
   * Emit data for region.
   *
   * @param {object} region
   *   The region to emit data to.
   */
  static emitRegion(region) {
    const slides = [];

    region.playlists.forEach((playlist) => {
      playlist.slides.forEach((slide) => {
        slides.push(slide);
      });
    });

    Logger.log('info', `Emitting data for region ${region.id}`);

    const event = new CustomEvent(`regionContent-${region.id}`, {
      detail: {
        slides
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Emit screen.
   *
   * @param {object} screen
   *   Screen data.
   */
  static emitScreen(screen) {
    const screenData = cloneDeep(screen);

    // Remove playlist data.
    for (let i = 0; i < screenData.regions.length; i += 1) {
      const region = screenData.regions[i];
      delete region.playlists;
    }

    Logger.log('info', 'Emitting screen');

    const event = new CustomEvent('screen', {
      detail: {
        screen: screenData
      }
    });
    document.dispatchEvent(event);
  }
}

export default Engine;
