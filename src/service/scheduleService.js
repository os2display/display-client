import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash.clonedeep';
import last from 'lodash.last';
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
    this.slideDoneHandler = this.slideDoneHandler.bind(this);
    this.findNextSlides = this.findNextSlides.bind(this);
    this.updateRegion = this.updateRegion.bind(this);

    document.addEventListener('slideDone', this.slideDoneHandler);
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

    const firstRun = !this.regions[regionId] ?? false;

    // Extract slides from playlists.
    // @TODO: Make sure changes in region playlists after firstRun is handled correctly instead of replacing region object.
    // @TODO: Handle schedules for each playlist and slides instead of just extracting slides from playlists.
    const slides = [];
    region.forEach((playlist) => {
      playlist?.slidesData.forEach((slide) => {
        const newSlide = cloneDeep(slide);
        newSlide.instanceId = uuidv4();
        slides.push(newSlide);
      });
    });

    this.regions[regionId] = {
      scheduledSlides: [],
      slides,
      region,
    };

    if (firstRun) {
      this.findNextSlides(regionId, null);
    }
  }

  /**
   * Find the next slides to execute in the given region.
   *
   * @param {string} regionId
   *   The id of the region.
   * @param {string|null} lastExecutionId
   *   The last executionId that was run.
   */
  findNextSlides(regionId, lastExecutionId) {
    const regionData = this.regions[regionId];

    const { scheduledSlides, slides } = regionData;

    // If no slides are present in region, send empty array of content.
    if (slides.length === 0) {
      ScheduleService.sendSlides(regionId, []);
      return;
    }

    let nextScheduledSlides = [];

    // Remove last executed element from scheduledSlides.
    if (lastExecutionId !== null) {
      nextScheduledSlides = scheduledSlides.filter((slide) => {
        return slide.executionId !== lastExecutionId;
      });
    }

    // Find index of lastScheduledLast in slides.
    let index;
    if (scheduledSlides?.length > 0) {
      const lastScheduledLast = last(scheduledSlides);
      index = slides.findIndex(
        (slide) => slide.instanceId === lastScheduledLast.instanceId
      );
    } else {
      index = -1;
    }

    // Add slides until scheduledSlides has length 3.
    while (nextScheduledSlides.length < 3) {
      index = (index + 1) % slides.length;
      const slide = cloneDeep(slides[index]);
      slide.executionId = uuidv4();
      slide.duration = slide.duration ?? 5000;
      nextScheduledSlides.push(slide);
    }

    this.regions[regionId] = {
      ...this.regions[regionId],
      scheduledSlides: nextScheduledSlides,
    };

    // Send slides to region.
    ScheduleService.sendSlides(regionId, nextScheduledSlides);
  }

  /**
   * Handles slideDone events.
   *
   * @param {CustomEvent} event
   *   The event.
   */
  slideDoneHandler(event) {
    const data = event.detail;
    const { regionId, executionId } = data;

    Logger.log(
      'info',
      `Event received: slideDone with executionId: ${executionId} and regionId: ${regionId}`
    );

    this.findNextSlides(regionId, executionId);
  }

  /**
   * Send next slides.
   *
   * @param {string} regionId
   *   The region id to send slides to.
   * @param {Array} nextSlides
   *   Array of slides.
   */
  static sendSlides(regionId, nextSlides) {
    const event = new CustomEvent(`regionContent-${regionId}`, {
      detail: {
        slides: nextSlides,
      },
    });
    document.dispatchEvent(event);
  }
}

export default ScheduleService;
