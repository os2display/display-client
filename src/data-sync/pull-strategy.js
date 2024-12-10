import cloneDeep from 'lodash.clonedeep';
import isPublished from '../util/isPublished';
import logger from '../logger/logger';
import ApiHelper from './api-helper';

/**
 * PullStrategy.
 *
 * Handles pull strategy.
 */
class PullStrategy {
  lastestScreenData;

  // Helper for all api calls.
  apiHelper;

  // Fetch-interval in ms.
  interval;

  // Path to screen that should be loaded data for.
  entryPoint = '';

  /**
   * Constructor.
   *
   * @param {object} config
   *   The config object.
   */
  constructor(config) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.getScreen = this.getScreen.bind(this);

    this.interval = config?.interval ?? 60000 * 5;
    this.entryPoint = config.entryPoint;

    this.apiHelper = new ApiHelper(config.endpoint ?? '');
  }

  /**
   * Gets all campaigns, both from screen and groups.
   *
   * @param {object} screen The screen object to extract campaigns from.
   * @returns {Promise<object>} Array of campaigns (playlists).
   */
  async getCampaignsData(screen) {
    const screenGroupCampaigns = [];

    try {
      const response = await this.apiHelper.getPath(screen.inScreenGroups);

      if (Object.prototype.hasOwnProperty.call(response, 'hydra:member')) {
        const promises = [];

        response['hydra:member'].forEach((group) => {
          promises.push(this.apiHelper.getAllResultsFromPath(group.campaigns));
        });

        await Promise.allSettled(promises).then((results) => {
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              result.value.results.forEach(({ campaign }) => {
                screenGroupCampaigns.push(campaign);
              });
            }
          });
        });
      }
    } catch (err) {
      logger.error(err);
    }

    let screenCampaigns = [];

    try {
      const screenCampaignsResponse = await this.apiHelper.getPath(
        screen.campaigns
      );

      screenCampaigns = screenCampaignsResponse['hydra:member'].map(
        ({ campaign }) => campaign
      );
    } catch (err) {
      logger.error(err);
    }

    return new Promise((resolve) => {
      resolve([...screenCampaigns, ...screenGroupCampaigns]);
    });
  }

  /**
   * Get slides for regions.
   *
   * @param {Array} regions Paths to regions.
   * @returns {Promise<object>} Regions data.
   */
  async getRegions(regions) {
    const reg = /\/v2\/screens\/.*\/regions\/(?<regionId>.*)\/playlists/;

    return new Promise((resolve, reject) => {
      const promises = [];
      const regionData = {};

      regions.forEach((regionPath) => {
        promises.push(this.apiHelper.getAllResultsFromPath(regionPath));
      });

      Promise.allSettled(promises)
        .then((results) => {
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              const members = result?.value?.results ?? [];
              const matches = result?.value?.path?.match(reg) ?? [];

              if (matches?.groups?.regionId) {
                regionData[matches.groups.regionId] = members.map(
                  ({ playlist }) => playlist
                );
              }
            }
          });

          resolve(regionData);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Get slides for the given regions.
   *
   * @param {object} regions Regions to fetch slides for.
   * @returns {Promise<object>} Promise with slides for the given regions.
   */
  async getSlidesForRegions(regions) {
    return new Promise((resolve, reject) => {
      const promises = [];
      const regionData = cloneDeep(regions);

      // @TODO: Fix eslint-raised issues.
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const regionKey in regionData) {
        const playlists = regionData[regionKey];
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const playlistKey in playlists) {
          promises.push(
            this.apiHelper.getAllResultsFromPath(
              regionData[regionKey][playlistKey].slides,
              {
                regionKey,
                playlistKey,
              }
            )
          );
        }
      }

      Promise.allSettled(promises)
        .then((results) => {
          results.forEach((result) => {
            if (
              result.status === 'fulfilled' &&
              Object.prototype.hasOwnProperty.call(result.value, 'keys')
            ) {
              regionData[result.value.keys.regionKey][
                result.value.keys.playlistKey
              ].slidesData = result.value.results.map(
                (playlistSlide) => playlistSlide.slide
              );
            }
          });
          resolve(regionData);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Fetch screen.
   *
   * @param {string} screenPath Path to the screen.
   */
  async getScreen(screenPath) {
    let screen;

    // Fetch screen
    try {
      screen = await this.apiHelper.getPath(screenPath);
    } catch (err) {
      logger.warn(
        `Screen (${screenPath}) not loaded. Aborting content update.`
      );

      return;
    }

    if (screen === null) {
      logger.warn(`Screen (${screenPath}) not loaded`);
      return;
    }

    const newScreen = cloneDeep(screen);

    newScreen.hasActiveCampaign = false;

    const newScreenChecksums = newScreen?.relationsChecksum ?? [];
    const oldScreenChecksums =
      this.lastestScreenData?.relationsChecksum ?? null;

    if (
      oldScreenChecksums === null ||
      oldScreenChecksums?.campaigns !== newScreenChecksums?.campaigns ||
      oldScreenChecksums?.inScreenGroups !== newScreenChecksums?.inScreenGroups
    ) {
      logger.info(`Campaigns or screen groups modified.`);
      newScreen.campaignsData = await this.getCampaignsData(newScreen);
    } else {
      logger.info(`Campaigns or screen groups not modified.`);
      newScreen.campaignsData = this.lastestScreenData.campaignsData;
    }

    if (newScreen.campaignsData.length > 0) {
      newScreen.campaignsData.forEach(({ published }) => {
        if (isPublished(published)) {
          newScreen.hasActiveCampaign = true;
        }
      });
    }

    // With active campaigns, we override region/layout values.
    if (newScreen.hasActiveCampaign) {
      logger.info(`Has active campaign.`);

      // Create ulid to connect the campaign with the regions/playlists.
      const campaignRegionId = '01G112XBWFPY029RYFB8X2H4KD';

      // Campaigns are always in full screen layout, for simplicity.
      newScreen.layoutData = {
        grid: {
          rows: 1,
          columns: 1,
        },
        regions: [
          {
            '@id': `/v2/layouts/regions/${campaignRegionId}`,
            gridArea: ['a'],
          },
        ],
      };

      newScreen.regionData = {};
      newScreen.regionData[campaignRegionId] = newScreen.campaignsData;
      newScreen.regions = [
        `/v2/screens/01FV9K4K0Y0X0K1J88SQ6B64VT/regions/${campaignRegionId}/playlists`,
      ];
      newScreen.regionData = await this.getSlidesForRegions(
        newScreen.regionData
      );
    } else {
      logger.info(`Has no active campaign.`);

      // Get layout: Defines layout and regions.
      if (
        this.lastestScreenData?.hasActiveCampaign ||
        oldScreenChecksums === null ||
        oldScreenChecksums?.layout !== newScreenChecksums?.layout
      ) {
        logger.info(`Layout changed since last fetch.`);
        newScreen.layoutData = await this.apiHelper.getPath(newScreen.layout);
      } else {
        // Get layout: Defines layout and regions.
        logger.info(`Layout not changed since last fetch.`);
        newScreen.layoutData = this.lastestScreenData.layoutData;
      }

      // Fetch regions playlists: Yields playlists of slides for the regions
      if (
        this.lastestScreenData?.hasActiveCampaign ||
        oldScreenChecksums === null ||
        oldScreenChecksums?.regions !== newScreenChecksums?.regions
      ) {
        logger.info(`Regions changed since last fetch.`);
        const regions = await this.getRegions(newScreen.regions);
        newScreen.regionData = await this.getSlidesForRegions(regions);
      } else {
        logger.info(`Regions not changed since last fetch.`);
        newScreen.regionData = this.lastestScreenData.regionData;
      }
    }

    // Cached data.
    const fetchedTemplates = {};
    const fetchedMedia = {};

    // Iterate all slides and load required relations.
    const { regionData } = newScreen;
    /* eslint-disable no-restricted-syntax,no-await-in-loop */
    for (const regionKey of Object.keys(regionData)) {
      const regionDataEntry = regionData[regionKey];

      for (const playlistKey of Object.keys(regionDataEntry)) {
        const dataEntryPlaylist = regionDataEntry[playlistKey];
        const dataEntrySlidesData = dataEntryPlaylist.slidesData;

        for (const slideKey of Object.keys(dataEntrySlidesData)) {
          const slide = cloneDeep(dataEntrySlidesData[slideKey]);

          let previousSlide = null;

          // Find slide in previous data for comparing relationsChecksum values.
          if (
            this.lastestScreenData?.regionData[regionKey] &&
            this.lastestScreenData.regionData[regionKey][playlistKey] &&
            this.lastestScreenData.regionData[regionKey][playlistKey]
              .slidesData[slideKey]
          ) {
            previousSlide = cloneDeep(
              this.lastestScreenData.regionData[regionKey][playlistKey]
                .slidesData[slideKey]
            );
          } else {
            previousSlide = {};
          }

          const newSlideChecksums = slide.relationsChecksum ?? [];
          const oldSlideChecksums = previousSlide?.relationsChecksum ?? null;

          // Fetch template if it has changed.
          if (
            oldSlideChecksums === null ||
            newSlideChecksums.templateInfo !== oldSlideChecksums.templateInfo
          ) {
            const templatePath = slide.templateInfo['@id'];

            // Load template into slide.templateData.
            if (
              Object.prototype.hasOwnProperty.call(
                fetchedTemplates,
                templatePath
              )
            ) {
              slide.templateData = fetchedTemplates[templatePath];
            } else {
              const templateData = await this.apiHelper.getPath(templatePath);
              slide.templateData = templateData;

              if (templateData !== null) {
                fetchedTemplates[templatePath] = templateData;
              }
            }
          } else {
            slide.templateData = previousSlide.templateData;
          }

          // A slide cannot work without templateData. Mark as invalid.
          if (slide.templateData === null) {
            logger.warn(
              `Template (${slide.templateInfo['@id']}) not loaded, slideId: ${slide['@id']}`
            );
            slide.invalid = true;
          }

          // Fetch media if it has changed.
          if (
            oldSlideChecksums === null ||
            newSlideChecksums.media !== oldSlideChecksums.media
          ) {
            const nextMediaData = {};

            for (const mediaId of slide.media) {
              if (Object.prototype.hasOwnProperty.call(fetchedMedia, mediaId)) {
                nextMediaData[mediaId] = fetchedMedia[mediaId];
              } else {
                const mediaData = await this.apiHelper.getPath(mediaId);
                nextMediaData[mediaId] = mediaData;

                if (mediaData !== null) {
                  fetchedMedia[mediaId] = mediaData;
                }
              }
            }

            slide.mediaData = nextMediaData;
          } else {
            slide.mediaData = previousSlide.mediaData;
          }

          // Fetch feed.
          if (slide?.feed?.feedUrl !== undefined) {
            slide.feedData = await this.apiHelper.getPath(slide.feed.feedUrl);
          }

          dataEntrySlidesData[slideKey] = slide;
        }
      }
    }
    /* eslint-enable no-restricted-syntax,no-await-in-loop */

    this.lastestScreenData = newScreen;

    // Deliver result to rendering
    const event = new CustomEvent('content', {
      detail: {
        screen: newScreen,
      },
    });
    document.dispatchEvent(event);
  }

  getPath(id) {
    return this.apiHelper.getPath(id);
  }

  async getTemplateData(slide) {
    return new Promise((resolve) => {
      const templatePath = slide.templateInfo['@id'];

      this.apiHelper.getPath(templatePath).then((data) => {
        resolve(data);
      });
    });
  }

  async getFeedData(slide) {
    return new Promise((resolve) => {
      if (!slide?.feed?.feedUrl) {
        resolve([]);
      } else {
        this.apiHelper.getPath(slide.feed.feedUrl).then((data) => {
          resolve(data);
        });
      }
    });
  }

  async getMediaData(media) {
    return new Promise((resolve) => {
      this.apiHelper.getPath(media).then((data) => {
        resolve(data);
      });
    });
  }

  /**
   * Start the data synchronization.
   */
  start() {
    // Pull now.
    this.getScreen(this.entryPoint).then(() => {
      // Make sure nothing is running.
      this.stop();

      // Start interval for pull periodically.
      this.activeInterval = setInterval(
        () => this.getScreen(this.entryPoint),
        this.interval
      );
    });
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
