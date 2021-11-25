import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash.clonedeep';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
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
    const slides = [];

    region.forEach((playlist, id) => {
      playlist?.slidesData.forEach((slide) => {
        const newSlide = cloneDeep(slide);
        newSlide.executionId = id + uuidv4();

        // Use old executionId if it exists.
        if (this.regions[regionId]?.slides) {
          const findSlide = this.regions[regionId].slides.find(
            (oldSlide) => oldSlide['@id'] === newSlide['@id']
          );

          // @TODO: The same slide can exist in more than one playlist. These should have different executionIds.

          if (findSlide) {
            newSlide.executionId = findSlide.executionId;
          }
        }

        slides.push(newSlide);
      });
    });

    // Calculate a hash of the region to test if it has changed.
    const hash = Base64.stringify(sha256(JSON.stringify({ region, slides })));
    const newContent = hash !== this?.regions[regionId]?.hash;

    // Update region.
    this.regions[regionId] = {
      hash,
      slides,
      region,
    };

    if (newContent) {
      // Send slides to region.
      ScheduleService.sendSlides(regionId, slides);
    }
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
