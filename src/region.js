import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './region.scss';
import { createGridArea } from 'os2display-grid-generator';
import Slide from './slide';
import ErrorBoundary from './error-boundary';
import idFromHydra from './id-from-hydra';

/**
 * Region component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.region
 *   The region content.
 * @returns {object}
 *   The component.
 */
function Region({ region }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [nextSlide, setNextSlide] = useState(null);
  const rootStyle = {};
  const regionId = idFromHydra(region['@id']);

  /**
   * Find the slide after the slide with the fromId.
   *
   * @param {number} fromId
   *   The id from which the next slide is determined.
   * @returns {object}
   *   The slide.
   */
  function findNextSlide(fromId) {
    const slideIndex = slides.findIndex(
      (slideElement) => slideElement.executionId === fromId
    );
    return slides[(slideIndex + 1) % slides.length];
  }

  rootStyle.gridArea = createGridArea(region.gridArea);

  /**
   * @param {object} slide
   *   The slide.
   */
  function slideDone(slide) {
    // Go to next slide.
    setCurrentSlide((previousSlide) => {
      return findNextSlide(previousSlide.executionId);
    });

    // Go to next slide.
    setNextSlide((previousSlide) => {
      return findNextSlide(previousSlide.executionId);
    });

    // Emit slideDone event.
    const slideDoneEvent = new CustomEvent('slideDone', {
      detail: {
        regionId,
        instanceId: slide.instanceId,
        executionId: slide.executionId,
      },
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
    document.addEventListener(
      `regionContent-${regionId}`,
      regionContentListener
    );

    return function cleanup() {
      document.removeEventListener(
        `regionContent-${regionId}`,
        regionContentListener
      );
    };
  }, []);

  useEffect(() => {
    // Notify that region is ready.
    const event = new CustomEvent('regionReady', {
      detail: {
        id: regionId,
      },
    });
    document.dispatchEvent(event);
  }, [region]);

  useEffect(() => {
    const findCurrent = slides.find(
      (slide) => currentSlide?.executionId === slide.executionId
    );

    if (!findCurrent && slides?.length > 0) {
      const slide = slides[0];
      setCurrentSlide(slide);
    }

    const findNext = slides.find(
      (slide) => nextSlide?.executionId === slide.executionId
    );

    if (!findNext && slides?.length > 1) {
      const slide = slides[1];
      setNextSlide(slide);
    }
  }, [slides]);

  return (
    <div className="Region" style={rootStyle} id={regionId}>
      <ErrorBoundary>
        <>
          {slides &&
            currentSlide &&
            slides.map((slide) => (
              <Slide
                slide={slide}
                id={slide.executionId}
                run={currentSlide.executionId === slide.executionId}
                slideDone={slideDone}
                isNextSlide={nextSlide.executionId === slide.executionId}
                prevSlideDuration={currentSlide.duration}
                key={slide.executionId}
              />
            ))}
        </>
      </ErrorBoundary>
    </div>
  );
}

Region.propTypes = {
  region: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    gridArea: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default Region;
