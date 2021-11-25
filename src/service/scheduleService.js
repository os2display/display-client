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

    region.forEach((playlist) => {
      playlist?.slidesData.forEach((slide) => {
        const newSlide = cloneDeep(slide);
        // Execution id is the product of region, playlist and slide id, to ensure uniqueness in the client.
        newSlide.executionId = Base64.stringify(
          sha256(regionId + playlist['@id'] + slide['@id'])
        );
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
      console.log('New Content', slides);

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
