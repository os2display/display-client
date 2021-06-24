import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './region.scss';
import Slide from './slide';

/**
 * Region component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.region
 *   The region content.
 * @returns {JSX.Element}
 *   The component.
 */
function Region({ region }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [nextSlide, setNextSlide] = useState(null);

  /**
   * Find the slide after the slide with the fromId.
   *
   * @param {number} fromId
   *   The id from which the next slide is determined.
   * @returns {JSX.Element}
   *   The slide.
   */
  function findNextSlide(fromId) {
    const slideIndex = slides.findIndex((slideElement) => slideElement.executionId === fromId);
    const slide = slides[(slideIndex + 1) % slides.length];
    return slide;
  }

  /**
   * @param {object} slide
   *   The slide.
   */
  function slideDone(slide) {
    // Go to next slide.
    setCurrentSlide((oldExecutionId) => {
      return findNextSlide(oldExecutionId);
    });

    // Go to next slide.
    setNextSlide((oldExecutionId) => {
      return findNextSlide(oldExecutionId);
    });

    // Emit slideDone event.
    const slideDoneEvent = new CustomEvent('slideDone', {
      detail: {
        regionId: region.id,
        instanceId: slide.instanceId,
        executionId: slide.executionId
      }
    });
    document.dispatchEvent(slideDoneEvent);
  }

  /**
   * Handle region content event.
   *
   * @param {CustomEvent} event
   *   The event. The data is contained in detail.
   */
  function regionContentListener(event) {
    setSlides([...event.detail.slides]);
  }

  useEffect(() => {
    document.addEventListener(`regionContent-${region.id}`, regionContentListener);

    return function cleanup() {
      document.removeEventListener(`regionContent-${region.id}`, regionContentListener);
    };
  }, []);

  useEffect(() => {
    // Notify that region is ready.
    const event = new CustomEvent('regionReady', {
      detail: {
        id: region.id
      }
    });
    document.dispatchEvent(event);
  }, [region]);

  useEffect(() => {
    const findCurrent = slides.find((slide) => currentSlide === slide.executionId);

    if (!findCurrent && slides?.length > 0) {
      const slide = slides[0];
      setCurrentSlide(slide);
    }
    const findNext = slides.find((slide) => nextSlide === slide.executionId);
    if (!findNext && slides?.length > 0) {
      const slide = slides[1];
      setNextSlide(slide.executionId);
    }
  }, [slides]);

  return (
    <div className="Region">
      {slides &&
        currentSlide &&
        slides.map((slide) => (
          <Slide
            slide={slide}
            id={slide.executionId}
            run={currentSlide.executionId === slide.executionId}
            slideDone={slideDone}
            nextSlide={nextSlide === slide.executionId}
            prevSlideDuration={currentSlide.duration}
            key={slide.executionId}
          />
        ))}
    </div>
  );
}

Region.propTypes = {
  region: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};

export default Region;
