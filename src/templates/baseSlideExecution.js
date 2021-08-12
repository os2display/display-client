/**
 * BaseSlideExecution.
 *
 * Slide runs for duration then calls slideDone().
 */
class BaseSlideExecution {
  // Function to call when the slide is done executing.
  slideDone;

  // Slide that should be run.
  slide;

  // Slide timeout.
  slideTimeout = null;

  /**
   * Constructor.
   *
   * @param {object} slide
   *   The slide to execute.
   * @param {Function} slideDone
   *   The function to invoke when execution is done.
   */
  constructor(slide, slideDone, duration) {
    this.slide = slide;
    this.slideDone = slideDone;
    this.duration = duration;
  }

  /**
   * Start execution of slide.
   *
   * @param {number} alternativeDuration
   *   Slide duration in milliseconds.
   */
  start(alternativeDuration) {
    let useDuration = this.duration;
    if (alternativeDuration) {
      useDuration = alternativeDuration;
    }
    if (this.slideTimeout !== null) {
      clearTimeout(this.slideTimeout);
    }

    // Wait duration when call slideDone.
    this.slideTimeout = setTimeout(() => {
      this.slideDone(this.slide);
      this.slideTimeout = null;
    }, useDuration);
  }

  /**
   * Stops execution timeout.
   */
  stop() {
    if (this.slideTimeout !== null) {
      clearTimeout(this.slideTimeout);
      this.slideTimeout = null;
    }
  }
}

export default BaseSlideExecution;
