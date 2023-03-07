import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Logger from '../logger/logger';
import DataSync from '../data-sync/data-sync';
import ScheduleService from './scheduleService';
import ConfigLoader from '../config-loader';

/**
 * ContentService.
 *
 * The central component responsible for receiving data from DataSync and sending data to the react components.
 */
class ContentService {
  dataSync;

  currentScreen;

  scheduleService;

  screenHash;

  /**
   * Constructor.
   */
  constructor() {
    // Setup schedule service.
    this.scheduleService = new ScheduleService();

    this.startSyncing = this.startSyncing.bind(this);
    this.stopSyncHandler = this.stopSyncHandler.bind(this);
    this.startDataSyncHandler = this.startDataSyncHandler.bind(this);
    this.regionReadyHandler = this.regionReadyHandler.bind(this);
    this.regionRemovedHandler = this.regionRemovedHandler.bind(this);
    this.contentHandler = this.contentHandler.bind(this);
    this.start = this.start.bind(this);
  }

  /**
   * Start data synchronization.
   *
   * @param {string} screenPath Path to the screen.
   */
  startSyncing(screenPath) {
    Logger.log('info', 'Starting data synchronization');

    ConfigLoader.loadConfig().then((config) => {
      const dataStrategy = { ...config.dataStrategy };

      if (screenPath) {
        dataStrategy.config.entryPoint = screenPath;
      }

      this.dataSync = new DataSync(dataStrategy);
      this.dataSync.start();
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
   *
   * @param {CustomEvent} event
   *   The event.
   */
  startDataSyncHandler(event) {
    const data = event.detail;

    this.stopSyncHandler();

    if (data?.screenPath) {
      Logger.log(
        'info',
        `Event received: Start data synchronization from ${data.screenPath}`
      );
      this.startSyncing(data.screenPath);
    } else {
      Logger.log('info', 'Event received: Start data synchronization');
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
    this.currentScreen = data.screen;

    const screenData = { ...this.currentScreen };

    // Remove regionData to only emit screen when it has changed.
    for (let i = 0; i < screenData.regions.length; i += 1) {
      delete screenData.regionData;
    }

    const newHash = Base64.stringify(sha256(JSON.stringify(screenData)));

    if (newHash !== this.screenHash) {
      Logger.log('info', 'Screen has changed. Emitting screen.');
      this.screenHash = newHash;
      ContentService.emitScreen(screenData);
    } else {
      Logger.log('info', 'Screen has not changed. Not emitting screen.');

      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const regionKey in data.screen.regionData) {
        const region = data.screen.regionData[regionKey];
        this.scheduleService.updateRegion(regionKey, region);
      }
    }
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

    if (this.currentScreen) {
      this.scheduleService.updateRegion(
        regionId,
        this.currentScreen.regionData[regionId]
      );
    }
  }

  /**
   * Region removed handler.
   *
   * @param {CustomEvent} event
   *   The event.
   */
  regionRemovedHandler(event) {
    const data = event.detail;
    const regionId = data.id;

    Logger.log('info', `Event received: regionRemoved for ${regionId}`);

    this.scheduleService.regionRemoved(regionId);
  }

  /**
   * Start the engine.
   */
  start() {
    Logger.log('info', 'Content service started.');

    document.addEventListener('stopDataSync', this.stopSyncHandler);
    document.addEventListener('startDataSync', this.startDataSyncHandler);
    document.addEventListener('content', this.contentHandler);
    document.addEventListener('regionReady', this.regionReadyHandler);
    document.addEventListener('regionRemoved', this.regionRemovedHandler);
  }

  /**
   * Stop the engine.
   */
  stop() {
    Logger.log('info', 'Content service stopped.');

    document.removeEventListener('stopDataSync', this.stopSyncHandler);
    document.removeEventListener('startDataSync', this.startDataSyncHandler);
    document.removeEventListener('content', this.contentHandler);
    document.removeEventListener('regionReady', this.regionReadyHandler);
    document.removeEventListener('regionRemoved', this.regionRemovedHandler);
  }

  /**
   * Emit screen.
   *
   * @param {object} screen
   *   Screen data.
   */
  static emitScreen(screen) {
    Logger.log('info', 'Emitting screen');

    const event = new CustomEvent('screen', {
      detail: {
        screen,
      },
    });
    document.dispatchEvent(event);
  }
}

export default ContentService;
