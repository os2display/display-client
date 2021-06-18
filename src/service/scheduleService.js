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
   * @param {object} region
   *   The region, with playlists and slides, to start scheduling.
   */
  updateRegion(region) {
    Logger.log('info', 'Invoking startRegion');

    const firstRun = !this.regions[region.id] ?? false;

    // Extract slides from playlists.
    // @TODO: Handle schedules for each playlist and slides instead of just extracting slides from playlists.
    if (firstRun) {
      const slides = [];
      region.playlists.forEach((playlist) => {
        playlist.slides.forEach((slide) => {
          const newSlide = cloneDeep(slide);
          newSlide.instanceId = uuidv4();
          slides.push(newSlide);
        });
      });

      this.regions[region.id] = {
        scheduledSlides: [],
        slides,
        region
      };
    }

    if (firstRun) {
      Logger.log('info', 'First run. Invoking nextSlide.');

      this.findNextSlides(region.id);
    }
  }

  findNextSlides(regionId, lastExecutionId) {
    const regionData = this.regions[regionId];

    const { region, scheduledSlides, slides } = regionData;

    Logger.log('info', `ScheduleService: Invoking findNextSlides(${region?.id})`);

    // If no slides are present in region, send empty array of content.
    if (slides.length === 0) {
      ScheduleService.sendSlides(region.id, []);
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
      index = slides.findIndex((slide) => slide.instanceId === lastScheduledLast.instanceId);
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

    this.regions[regionId] = { ...this.regions[regionId], scheduledSlides: nextScheduledSlides };

    // Send slides to region.
    ScheduleService.sendSlides(region.id, nextScheduledSlides);
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

    Logger.log('info', `Event received: slideDone with executionId: ${executionId} and regionId: ${regionId}`);

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
        slides: nextSlides
      }
    });
    document.dispatchEvent(event);
  }
}

export default ScheduleService;
