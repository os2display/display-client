import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash.clonedeep';
import tail from 'lodash.tail';
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

    this.regions[region.id] = {
      scheduledSlides: [],
      region
    };

    if (firstRun) {
      Logger.log('info', 'First run. Invoking nextSlide.');

      ScheduleService.findNextSlides(this.regions[region.id]);
    }
  }

  static findNextSlides(regionData) {
    const { region, scheduledSlides } = regionData;

    Logger.log('info', `ScheduleService: Invoking findNextSlides(${region?.id})`);

    // Extract slides from playlists.
    // @TODO: Handle schedules for each playlist and slides instead of just extracting slides from playlists.
    const slides = [];
    region.playlists.forEach((playlist) => {
      playlist.slides.forEach((slide) => {
        slides.push(slide);
      });
    });

    // If no slides are present in region, send empty array of content.
    if (slides.length === 0) {
      ScheduleService.sendSlides(region.id, []);
      return;
    }

    // Remove first element of scheduledSlides.
    const nextScheduledSlides = tail(scheduledSlides);

    // Find index of lastScheduledLast in slides.
    let index;
    if (nextScheduledSlides?.length > 0) {
      const lastScheduledLast = last(scheduledSlides);
      index = slides.findIndex((slide) => slide.id === lastScheduledLast.id);
    } else {
      index = -1;
    }

    // Add slides until scheduledSlides has length 3.
    while (nextScheduledSlides.length < 3) {
      index = (index + 1) % slides.length;
      const slide = cloneDeep(slides[index]);
      slide.slideExecutionId = uuidv4();
      slide.duration = slide.duration ?? 5000;
      nextScheduledSlides.push(slide);
    }

    region.scheduledSlides = nextScheduledSlides;

    console.log(nextScheduledSlides);

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
    const { regionId, slideExecutionId } = data;

    Logger.log(
      'info',
      `Event received: slideDone with slideExecutionId: ${slideExecutionId} and regionId: ${regionId}`
    );

    const region = this.regions[regionId];
    ScheduleService.findNextSlides(region);
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
