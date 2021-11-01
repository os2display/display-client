import cloneDeep from 'lodash.clonedeep';

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
    const response = await fetch(this.endpoint + path);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
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
    do {
      // eslint-disable-next-line no-await-in-loop
      const responseData = await this.getPath(nextPath);
      results = results.concat(responseData['hydra:member']);

      if (
        responseData['hydra:view'] &&
        responseData['hydra:view']['hydra:next']
      ) {
        nextPath = responseData['hydra:view']['hydra:next'];
      } else {
        nextPath = false;
      }
    } while (nextPath);
    return { path, results, keys };
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
              const members = result.value.results;
              const matches = result.value.path.match(reg);

              if (matches?.groups?.regionId) {
                regionData[matches.groups.regionId] = members.map(
                  (member) => member.playlist
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
          // @TODO: Handle pagination.
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
            if (result.status === 'fulfilled') {
              regionData[result.value.keys.regionKey][
                result.value.keys.playlistKey
              ].slidesData = result.value.results.map((playlistSlide) => playlistSlide.slide);
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
    // @TODO: Error handling.

    // Fetch screen
    const screen = await this.getPath(screenPath);
    const newScreen = cloneDeep(screen);

    // Get layout: Defines layout and regions.
    newScreen.layoutData = await this.getPath(screen.layout);

    // Fetch regions playlists: Yields playlists of slides for the regions
    const regions = await this.getRegions(newScreen.regions);
    newScreen.regionData = await this.getSlidesForRegions(regions);

    // Template cache.
    const fetchedTemplates = {};
    const fetchedMedia = {};

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

          slide.mediaData = {};

          // Load media for the slide into slide.mediaData object.
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
