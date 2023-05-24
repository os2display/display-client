import cloneDeep from 'lodash.clonedeep';
import isPublished from '../util/isPublished';
import * as Logger from '../logger/logger';
import localStorageKeys from '../local-storage-keys';

/**
 * PullStrategy.
 *
 * Handles pull strategy.
 */
class PullStrategy {
  // The API endpoint.
  endpoint;

  // Fetch-interval in ms.
  interval;

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

    this.interval = config?.interval ?? 5000;
    this.endpoint = config?.endpoint ?? '';
    // @TODO: Get this entry point in a more dynamic way.
    this.entryPoint = config.entryPoint;
  }

  /**
   * Get result from path.
   *
   * @param {string} path Path to the resource.
   * @returns {Promise<any>} Promise with data.
   */
  async getPath(path) {
    const token = localStorage.getItem(localStorageKeys.API_TOKEN) ?? '';
    const tenantKey = localStorage.getItem(localStorageKeys.TENANT_KEY) ?? '';

    if (!path) {
      throw new Error('No path');
    }

    let response;

    try {
      Logger.log('info', `Fetching: ${this.endpoint + path}`);

      response = await fetch(this.endpoint + path, {
        headers: {
          authorization: `Bearer ${token}`,
          'Authorization-Tenant-Key': tenantKey,
        },
      });
    } catch (err) {
      Logger.log('error', `Failed to fetch: ${this.endpoint + path}`);
      throw err;
    }

    if (response.ok === false) {
      if (response.status === 401) {
        document.dispatchEvent(new Event('stopDataSync'));
        document.dispatchEvent(new Event('reauthenticate'));
      }

      Logger.log(
        'error',
        `Failed to fetch (status: ${response.status}): ${this.endpoint + path}`
      );

      return null;
    }

    return response.json();
  }

  /**
   * Gets all resources from the given path. Follows hydra:view.hydra:next links.
   *
   * @param {string} path Path to the resources.
   * @param {object} keys Keys that should be passed along with the result.
   * @returns {Promise<*>} Promise with all resources from a path.
   */
  async getAllResultsFromPath(path, keys = {}) {
    let results = [];
    let nextPath = `${path}`;
    let continueLoop = false;
    let page = 1;

    do {
      try {
        // eslint-disable-next-line no-await-in-loop
        const responseData = await this.getPath(nextPath);
        results = results.concat(responseData['hydra:member']);
        if (results.length < responseData['hydra:totalItems']) {
          page += 1;
          continueLoop = true;
          nextPath = `${path}?page=${page}`;
        } else {
          continueLoop = false;
        }
      } catch (err) {
        return {};
      }
    } while (continueLoop);

    return { path, results, keys };
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
      const response = await this.getPath(screen.inScreenGroups);

      if (Object.prototype.hasOwnProperty.call(response, 'hydra:member')) {
        const promises = [];

        response['hydra:member'].forEach((group) => {
          promises.push(this.getAllResultsFromPath(group.campaigns));
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
      const screenCampaignsResponse = await this.getPath(screen.campaigns);

      screenCampaigns = screenCampaignsResponse['hydra:member'].map(
        (campaign) => campaign.campaign
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
        promises.push(this.getAllResultsFromPath(regionPath));
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
            this.getAllResultsFromPath(
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
      screen = await this.getPath(screenPath);
    } catch (err) {
      return;
    }

    const newScreen = cloneDeep(screen);

    // Campaigns data
    let hasActiveCampaign = false;

    newScreen.campaignsData = await this.getCampaignsData(screen);

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
      newScreen.layoutData = await this.getPath(screen.layout);

      // Fetch regions playlists: Yields playlists of slides for the regions
      const regions = await this.getRegions(newScreen.regions);
      newScreen.regionData = await this.getSlidesForRegions(regions);
    }

    // Template cache.
    const fetchedTemplates = {};
    const fetchedMedia = {};
    const fetchedThemes = {};

    // Iterate all slides:
    // - attach template data.
    // - attach media data.
    // @TODO: Fix eslint-raised issues.
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const regionKey in newScreen.regionData) {
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const playlistKey in newScreen.regionData[regionKey]) {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const slideKey in newScreen.regionData[regionKey][playlistKey]
          .slidesData) {
          const slide =
            newScreen.regionData[regionKey][playlistKey].slidesData[slideKey];
          const templatePath = slide.templateInfo['@id'];

          // Load template into slide.templateData.
          // eslint-disable-next-line no-prototype-builtins
          if (fetchedTemplates.hasOwnProperty(templatePath)) {
            slide.templateData = fetchedTemplates[templatePath];
          } else {
            // eslint-disable-next-line no-await-in-loop
            const templateData = await this.getPath(templatePath);
            slide.templateData = templateData;
            fetchedTemplates[templatePath] = templateData;
          }

          if (slide?.theme !== '') {
            const themePath = slide.theme;
            // Load theme into slide.themeData.
            // eslint-disable-next-line no-prototype-builtins
            if (fetchedThemes.hasOwnProperty(themePath)) {
              slide.themeData = fetchedThemes[themePath];
            } else {
              // eslint-disable-next-line no-await-in-loop
              const themeData = await this.getPath(themePath);
              slide.themeData = themeData;
              fetchedThemes[themePath] = themeData;
            }
          }

          slide.mediaData = {};

          // Load media for the slide into slide.mediaData object.
          if (slide.themeData?.logo) {
            slide.media.push(slide.themeData.logo);
          }

          // eslint-disable-next-line no-restricted-syntax
          for (const mediaId of slide.media) {
            // eslint-disable-next-line no-prototype-builtins
            if (fetchedMedia.hasOwnProperty(mediaId)) {
              slide.mediaData[mediaId] = fetchedMedia[mediaId];
            } else {
              // eslint-disable-next-line no-await-in-loop
              const mediaData = await this.getPath(mediaId);
              slide.mediaData[mediaId] = mediaData;
              fetchedMedia[mediaId] = mediaData;
            }
          }

          if (slide?.feed?.feedUrl !== undefined) {
            // eslint-disable-next-line no-await-in-loop
            slide.feedData = await this.getPath(slide.feed.feedUrl);
          }
        }
      }
    }

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
