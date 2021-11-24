import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash.clonedeep';
import Logger from '../logger/logger';

/**
 * ScheduleService.
 *
 * Supplies slides to the different regions.
 * Handles content scheduling.
 */
class ScheduleService {
  regions = {};

  constructor() {
    this.updateRegion = this.updateRegion.bind(this);
  }

  /**
   * Handles region
   *
   * @param {string} regionId
   *   The ID of the region.
   * @param {object} region
   *   The region, with playlists and slides, to start scheduling.
   */
  updateRegion(regionId, region) {
    Logger.log('info', `ScheduleService: updateRegion(${regionId})`);

    if (!region || !regionId) {
      Logger.log('info', `ScheduleService: regionId and/or region not set.`);
      return;
    }

    // Extract slides from playlists.
    // @TODO: Make sure changes in region playlists after firstRun is handled correctly instead of replacing region object.
    const slides = [];

    region.forEach((playlist) => {
      playlist?.slidesData.forEach((slide) => {
        const newSlide = cloneDeep(slide);
        newSlide.executionId = uuidv4();
        slides.push(newSlide);
      });
    });

    this.regions[regionId] = {
      slides,
      region,
    };

    // Send slides to region.
    ScheduleService.sendSlides(regionId, slides);
  }

  /**
   * Send next slides.
   *
   * @param {string} regionId
   *   The region id to send slides to.
   * @param {Array} slides
   *   Array of slides.
   */
  static sendSlides(regionId, slides) {
    Logger.log('info', `sendSlides regionContent-${regionId}`);
    const event = new CustomEvent(`regionContent-${regionId}`, {
      detail: {
        slides,
      },
    });
    document.dispatchEvent(event);
  }
}

export default ScheduleService;
