import cloneDeep from 'lodash.clonedeep';
import Logger from '../logger/logger';

/**
 * PullStrategy.
 *
 * Handles pull strategy.
 */
class PullStrategy {
  // The endpoint where the screen can be fetched.
  endpoint = '';

  // Fetch-inteval in ms.
  interval = 5000;

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

  async getPath(path) {
    const response = await fetch(this.endpoint + path);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  }

  async getRegions(regions) {
    return new Promise((resolve, reject) => {
      const promises = [];
      const regionData = {};

      regions.forEach((regionPath) => {
        promises.push(this.getPath(regionPath));
      });

      Promise.allSettled(promises).then((results) => {
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            // @TODO: Handle pagination.
            const members = result.value['hydra:member'];
            // @TODO: Handle case that is not json-server. Can this be achieved from the API response instead?
            const regionIndex = result.value['@id'].split('region=')[1];
            regionData[regionIndex] = members;
          }
        });

        resolve(regionData);
      });
    });
  }

  async getPathWithKeys(path, keys) {
    const response = await fetch(this.endpoint + path);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    return {
      result: await response.json(),
      keys,
    };
  }

  async getSlidesForRegions(regions) {
    return new Promise((resolve, reject) => {
      const promises = [];
      const regionData = cloneDeep(regions);

      // @TODO: Rewrite to other construction than for in
      for (const regionKey in regionData) {
        const playlists = regionData[regionKey];
        for (const playlistKey in playlists) {
          promises.push(
            this.getPathWithKeys(regionData[regionKey][playlistKey].slides, {
              regionKey,
              playlistKey,
            })
          );
        }
      }

      Promise.allSettled(promises).then((results) => {
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            regionData[result.value.keys.regionKey][
              result.value.keys.playlistKey
            ].slidesData = result.value.result['hydra:member'];
          }
        });

        resolve(regionData);
      });
    });
  }

  /**
   * Fetch screen.
   */
  async getScreen() {
    // Fetch screen
    const screen = await this.getPath(this.entryPoint);
    const newScreen = cloneDeep(screen);

    // Get layout: Defines layout and regions.
    newScreen.layoutData = await this.getPath(screen.layout);

    // Fetch regions playlists: Yields playlists of slides for the regions
    const regions = await this.getRegions(newScreen.regions);
    newScreen.regionData = await this.getSlidesForRegions(regions);

    // Template cache.
    const fetchedTemplates = {};

    // Iterate all slides.
    for (const regionKey in newScreen.regionData) {
      for (const playlistKey in newScreen.regionData[regionKey]) {
        console.log(
          regionKey,
          playlistKey,
          newScreen.regionData[regionKey][playlistKey]
        );
        for (const slideKey in newScreen.regionData[regionKey][playlistKey]
          .slidesData) {
          const templatePath =
            newScreen.regionData[regionKey][playlistKey].slidesData[slideKey]
              .template['@id'];
          if (fetchedTemplates.hasOwnProperty(templatePath)) {
            newScreen.regionData[regionKey][playlistKey].slidesData[
              slideKey
            ].templateData = fetchedTemplates[templatePath];
          } else {
            const templateData = await this.getPath(templatePath);
            newScreen.regionData[regionKey][playlistKey].slidesData[
              slideKey
            ].templateData = templateData;
            fetchedTemplates[templatePath] = templateData;
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
    this.getScreen()
      .then(() => {
        // Make sure nothing is running.
        this.stop();

        // Start interval for pull periodically.
        this.activeInterval = setInterval(this.getScreen, this.interval);
      })
      .catch((err) => {
        console.error(err);
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
