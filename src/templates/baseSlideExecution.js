/**
 * BaseSlideExecution.
 *
 * Slide runs for duration then calls slideDone().
 */
class BaseSlideExecution {
  slideDone;

  slide;

  slideTimeout = null;

  constructor(slide, slideDone) {
    this.slide = slide;
    this.slideDone = slideDone;
  }

  start(duration) {
    if (this.slideTimeout !== null) {
      clearTimeout(this.slideTimeout);
    }

    this.slideTimeout = setTimeout(() => {
      this.slideDone(this.slide);
    }, duration);
  }

  stop() {
    if (this.slideTimeout !== null) {
      clearTimeout(this.slideTimeout);
      this.slideTimeout = null;
    }
  }
}

export default BaseSlideExecution;
