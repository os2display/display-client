import cloneDeep from 'lodash.clonedeep';
import isPublished from '../util/isPublished';
import Logger from '../logger/logger';
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
   * @returns {Array} array of campaigns (playlists).
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
              result.value.results.forEach((campaign) => {
                screenGroupCampaigns.push(campaign.campaign);
              });
            }
          });
        });
      }
    } catch (err) {
      Logger.log('error', err);
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
      Logger.log('error', err);
    }

    return [...screenCampaigns, ...screenGroupCampaigns];
  }

  /**
   * Get slides for regions.
   *
   * @param {Array} regions Paths to regions.
   * @returns {Promise<object>} Regions data.
   */
  async getRegions(regions) {
    const reg = /\/v1\/screens\/.*\/regions\/(?<regionId>.*)\/playlists/;

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
      Logger.log(
        'warn',
        `Screen (${screenPath}) not loaded. Aborting content update.`
      );

      return;
    }

    if (screen === null) {
      Logger.log('warn', `Screen (${screenPath}) not loaded`);
      return;
    }

    const newScreen = cloneDeep(screen);

    // Campaigns data
    let hasActiveCampaign = false;

    const newScreenModified = newScreen.relationsModified ?? [];
    const oldScreenModified = this.lastestScreenData?.relationsModified ?? [];

    if (
      oldScreenModified?.campaigns !== newScreenModified?.campaigns ||
      oldScreenModified?.inScreenGroups !== newScreenModified?.inScreenGroups
    ) {
      Logger.log('info', `Campaigns or screen groups are modified.`);
      newScreen.campaignsData = this.getCampaignsData(newScreen);
    } else {
      Logger.log('info', `Campaigns or screen groups not modified.`);
      newScreen.campaignsData = this.lastestScreenData.campaignsData;
    }

    if (newScreen.campaignsData.length > 0) {
      newScreen.campaignsData.forEach(({ published }) => {
        if (isPublished(published)) {
          hasActiveCampaign = true;
        }
      });
    }

    // With active campaigns, we override region/layout values.
    if (hasActiveCampaign) {
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
            '@id': `/v1/layouts/regions/${campaignRegionId}`,
            gridArea: ['a'],
          },
        ],
      };

      newScreen.regionData = {};
      newScreen.regionData[campaignRegionId] = newScreen.campaignsData;
      newScreen.regions = [
        `/v1/screens/01FV9K4K0Y0X0K1J88SQ6B64VT/regions/${campaignRegionId}/playlists`,
      ];
      newScreen.regionData = await this.getSlidesForRegions(
        newScreen.regionData
      );
    } else {
      // Get layout: Defines layout and regions.
      if (oldScreenModified.layout !== newScreenModified?.layout) {
        Logger.log('info', `Layout changed since last fetch.`);
        newScreen.layoutData = await this.apiHelper.getPath(newScreen.layout);
      } else {
        // Get layout: Defines layout and regions.
        Logger.log('info', `Layout not changed since last fetch.`);
        newScreen.layoutData = this.lastestScreenData.layoutData;
      }

      // Fetch regions playlists: Yields playlists of slides for the regions
      if (oldScreenModified?.regions !== newScreenModified.regions) {
        Logger.log('info', `Regions changed since last fetch.`);
        const regions = await this.getRegions(newScreen.regions);
        newScreen.regionData = await this.getSlidesForRegions(regions);
      } else {
        Logger.log('info', `Regions not changed since last fetch.`);
        newScreen.regionData = this.lastestScreenData.regionData;
      }
    }

    // Cached data.
    const fetchedTemplates = {};
    const fetchedMedia = {};
    const fetchedThemes = {};

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

          // Find slide in previous data for comparing relationsModified values.
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

          const newSlideModified = slide.relationsModified ?? [];
          const oldSlideModified = previousSlide?.relationsModified ?? [];

          // Fetch template if it has changed.
          if (newSlideModified.templateInfo !== oldSlideModified.templateInfo) {
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
            Logger.log(
              'warn',
              `Template (${slide.templateInfo['@id']}) not loaded, slideId: ${slide['@id']}`
            );
            slide.invalid = true;
          }

          // Fetch theme if it has changed.
          if (newSlideModified.theme !== oldSlideModified.theme) {
            if (slide?.theme !== '') {
              const themePath = slide.theme;
              // Load theme into slide.themeData.
              if (
                Object.prototype.hasOwnProperty.call(fetchedThemes, themePath)
              ) {
                slide.themeData = fetchedThemes[themePath];
              } else {
                const themeData = await this.apiHelper.getPath(themePath);
                slide.themeData = themeData;

                if (themeData !== null) {
                  fetchedThemes[themePath] = themeData;
                }
              }
            }
          } else {
            slide.themeData = previousSlide.themeData;
          }

          // Load media for the slide into slide.mediaData object.
          if (slide.themeData?.logo) {
            slide.media.push(slide.themeData.logo);
          }

          // Fetch media if it has changed.
          if (newSlideModified.media !== oldSlideModified.media) {
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

    Logger.log('info', `Emitting screen data.`);

    this.lastestScreenData = newScreen;

    // Deliver result to rendering
    const event = new CustomEvent('content', {
      detail: {
        screen: newScreen,
      },
    });
    document.dispatchEvent(event);
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
