import { React, useEffect, useState, createRef } from 'react';
import PropTypes from 'prop-types';
import './region.scss';
import { createGridArea } from 'os2display-grid-generator';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Slide from './slide';
import ErrorBoundary from './error-boundary';
import idFromPath from './id-from-path';

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
  const rootStyle = {};
  const regionId = idFromPath(region['@id']);
  const [nodeRefs, setNodeRefs] = useState({});

  rootStyle.gridArea = createGridArea(region.gridArea);

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

  /**
   * The slide is done executing.
   *
   * @param {object} slide - The slide.
   */
  function slideDone(slide) {
    const nextSlide = findNextSlide(slide.executionId);
    setCurrentSlide(nextSlide);

    // Emit slideDone event.
    const slideDoneEvent = new CustomEvent('slideDone', {
      detail: {
        regionId,
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

  // Setup event listener for region content.
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

    // add or remove refs
    setNodeRefs((prevNodeRefs) =>
      slides.reduce((res, element) => {
        res[element.executionId] =
          prevNodeRefs[element.executionId] || createRef();
        return res;
      }, {})
    );
  }, [slides]);

  return (
    <div className="Region" style={rootStyle} id={regionId}>
      <ErrorBoundary>
        <>
          <TransitionGroup component={null}>
            {currentSlide && (
              <CSSTransition
                key={currentSlide.executionId}
                timeout={1000}
                classNames="Slide"
                nodeRef={nodeRefs[currentSlide.executionId]}
              >
                <Slide
                  slide={currentSlide}
                  id={currentSlide.executionId}
                  run
                  slideDone={slideDone}
                  key={currentSlide.executionId}
                  forwardRef={nodeRefs[currentSlide.executionId]}
                />
              </CSSTransition>
            )}
          </TransitionGroup>
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
