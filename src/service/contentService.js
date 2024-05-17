import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Logger from '../logger/logger';
import DataSync from '../data-sync/data-sync';
import ScheduleService from './scheduleService';
import ConfigLoader from '../config-loader';
import PullStrategy from '../data-sync/pull-strategy';

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
      const dataStrategyConfig = { ...config.dataStrategy.config };

      if (screenPath) {
        dataStrategyConfig.entryPoint = screenPath;
      }

      dataStrategyConfig.endpoint = config.apiEndpoint;

      this.dataSync = new DataSync(dataStrategyConfig);
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

    Logger.log(
      'info',
      `Event received: Start data synchronization from ${data?.screenPath}`
    );
    if (data?.screenPath) {
      this.startSyncing(data.screenPath);
    } else {
      Logger.log('error', 'Error: screenPath not set.');
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

    // TODO: Handle issue where region data is not present for a given region. Remove given region content.

    if (newHash !== this.screenHash) {
      Logger.log('info', 'Screen has changed. Emitting screen.');
      this.screenHash = newHash;
      ContentService.emitScreen(screenData);
    } else {
      Logger.log('info', 'Screen has not changed. Not emitting screen.');

      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const regionKey in data.screen.regionData) {
        const region = this.currentScreen.regionData[regionKey];
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
    document.addEventListener('startPreview', this.startPreview);
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
    document.removeEventListener('startPreview', this.startPreview);
  }

  /**
   * Start preview.
   *
   * @param event
   */
  async startPreview(event) {
    const data = event.detail;
    const { mode, id } = data;
    Logger.log('info', `Starting preview. Mode: ${mode}, ID: ${id}`);

    const config = await ConfigLoader.loadConfig();


    if (mode === 'screen') {
      this.startSyncing(`/v2/screen/${id}`);
    } else if (mode === 'playlist') {
      const pullStrategy = new PullStrategy({
        endpoint: config.apiEndpoint,
      });

      const playlist = await pullStrategy.getPath(
        `/v2/playlists/${id}`
      );

      const playlistSlidesResponse = await pullStrategy.getPath(
        playlist.slides
      );

      playlist.slidesData = playlistSlidesResponse['hydra:member'].map(
        (playlistSlide) => playlistSlide.slide
      );

      for (const item of playlist.slidesData) {
        item.templateData = await pullStrategy.addTemplateData(item);
      }

      const screen = {
        '@id': '/v2/screens/SCREEN01234567890123456789',
        '@type': 'Screen',
        title: 'Preview',
        description: 'Screen for preview.',
        layout: '/v2/layouts/LAYOUT01234567890123456789',
        regions: [
          '/v2/screens/SCREEN01234567890123456789/regions/REGION01234567890123456789/playlists',
        ],
        regionData: {
          REGION01234567890123456789: [playlist],
        },
        layoutData: {
          '@id': '/v2/layouts/LAYOUT01234567890123456789',
          '@type': 'ScreenLayout',
          title: 'Full screen',
          grid: {
            rows: 1,
            columns: 1,
          },
          regions: [
            {
              '@type': 'ScreenLayoutRegions',
              '@id': '/v2/layouts/regions/REGION01234567890123456789',
              title: 'full',
              gridArea: ['a'],
              screenLayout: '/v2/layouts/LAYOUT01234567890123456789',
            },
          ],
        },
      };

      document.dispatchEvent(
        new CustomEvent('content', {
          detail: {
            screen,
          },
        })
      );
    } else if (mode === 'slide') {
      const pullStrategy = new PullStrategy({});
      // const slide = pullStrategy.getSlide(id);

      const screen = {
        // TODO: Build fake screen.
      };

      ContentService.emitScreen(screen);
    } else {
      Logger.error(`Unsupported preview mode: ${mode}.`);
    }
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
