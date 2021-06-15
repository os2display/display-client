import { v4 as uuidv4 } from 'uuid';
import Logger from '../logger/logger';

/**
 * ScheduleService.
 *
 * Supplies slides to the different regions.
 * Handles content scheduling.
 * Imposes maxExecution for each slide, to avoid slides not finishing execution.
 */
class ScheduleService {
  regions = {};

  maxExecutionTimeouts = {};

  constructor() {
    this.slideDoneHandler = this.slideDoneHandler.bind(this);
    this.startRegion = this.startRegion.bind(this);
    this.nextSlide = this.nextSlide.bind(this);

    document.addEventListener('slideDone', this.slideDoneHandler);
  }

  /**
   * Handles region
   *
   * @param {object} region
   *   The region, with playlists and slides, to start scheduling.
   */
  startRegion(region) {
    Logger.log('info', 'Invoking startRegion');

    const slides = [];
    const firstRun = !this.regions[region.id] ?? false;

    // @TODO: Handle schedules for each playlist and slides instead of just extracting slides from playlists.
    region.playlists.forEach((playlist) => {
      playlist.slides.forEach((slide) => {
        slides.push(slide);
      });
    });

    this.regions[region.id] = {
      slides,
      slideIndex: null,
      region
    };

    if (firstRun) {
      Logger.log('info', 'First run. Invoking nextSlide.');

      this.nextSlide(region.id, null);
    }
  }

  /**
   * Stop region scheduling.
   *
   * @param {string} regionId
   *   The regionId to stop scheduling.
   */
  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  stopRegion(regionId) {
    // @TODO: Remove region from saved regions.
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  maxExecutionTimeout(slideExecutionId) {
    // @TODO: Force transition to next slide in region by invoking slideDoneHandler.
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

    this.nextSlide(regionId, slideExecutionId);
  }

  /**
   * Send next slides.
   *
   * Setup maxExecution timeout.
   *
   * @param {string} regionId
   *   The region id to send slides for.
   * @param {string|null} currentSlideExecutionId
   *   The current slide execution id. NULL if first run.
   */
  nextSlide(regionId, currentSlideExecutionId) {
    Logger.log(
      'info',
      `Invoking scheduleService.nextSlide for region: ${regionId} and currentSlideExecutionId: ${currentSlideExecutionId}`
    );

    // Unregister maxRuntime timeout.
    if (currentSlideExecutionId !== null) {
      if (this.maxExecutionTimeouts[currentSlideExecutionId]) {
        clearTimeout(this.maxExecutionTimeouts[currentSlideExecutionId]);
        delete this.maxExecutionTimeouts[currentSlideExecutionId];
      }
    }

    const regionData = this.regions[regionId];
    const { slides } = regionData;

    regionData.slideIndex = (regionData.slideIndex !== null ? regionData.slideIndex + 1 : 0) % slides.length;

    // Find next 2 slides to execute with durations. This can be the same slide if the region only contains that slide.
    const firstSlide = slides[regionData.slideIndex];
    const secondSlide = slides[(regionData.slideIndex + 1) % slides.length];

    // Add slideExecutionId to each of the 2 slides.
    // @TODO: Preserve slideExecutionId for secondSlide when it becomes firstSlide.
    // @TODO: Find slide duration from playlist or slide.
    firstSlide.slideExecutionId = uuidv4();
    firstSlide.duration = 5000 + Math.floor(Math.random() * 10000);
    secondSlide.slideExecutionId = uuidv4();
    secondSlide.duration = 6000;

    // Emit next 2 slides to Region.
    const event = new CustomEvent(`regionContent-${regionId}`, {
      detail: {
        slides: [firstSlide, secondSlide]
      }
    });
    document.dispatchEvent(event);

    // @TODO: Find a reasonable maxExecutionTimeout.
    this.maxExecutionTimeouts[currentSlideExecutionId] = setTimeout(
      () => this.maxExecutionTimeout(currentSlideExecutionId),
      60000
    );
  }
}

export default ScheduleService;
