import { React, useEffect, useState, createRef } from 'react';
import PropTypes from 'prop-types';
import './touch-region.scss';
import { createGridArea } from 'os2display-grid-generator';
import Slide from './slide';
import ErrorBoundary from './error-boundary';
import idFromPath from './id-from-path';
import { ReactComponent as IconClose } from './assets/icon-close.svg';
import { ReactComponent as IconPointer } from './assets/icon-pointer.svg';

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
function TouchRegion({ region }) {
  const [slides, setSlides] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [displayClose, setDisplayClose] = useState(false);
  const [nodeRefs, setNodeRefs] = useState({});
  const [runId, setRunId] = useState(null);

  const rootStyle = {};
  const regionId = idFromPath(region['@id']);

  rootStyle.gridArea = createGridArea(region.gridArea);

  /**
   * The slide is done executing.
   *
   * @param {object} slide - The slide.
   */
  function slideDone(slide) {
    setDisplayClose(false);
    setCurrentSlide(null);

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
      // Emit event that region has been removed.
      const event = new CustomEvent('regionRemoved', {
        detail: {
          id: regionId,
        },
      });
      document.dispatchEvent(event);

      // Cleanup event listener.
      document.removeEventListener(
        `regionContent-${regionId}`,
        regionContentListener
      );
    };
  }, []);

  // Notify that region is ready.
  useEffect(() => {
    const event = new CustomEvent('regionReady', {
      detail: {
        id: regionId,
      },
    });
    document.dispatchEvent(event);
  }, [region]);

  // Make sure current slide is set.
  useEffect(() => {
    if (!slides) return;

    // Add or remove refs.
    setNodeRefs((prevNodeRefs) =>
      slides.reduce((res, element) => {
        res[element.executionId] =
          prevNodeRefs[element.executionId] || createRef();
        return res;
      }, {})
    );
  }, [slides]);

  const startSlide = (slide) => {
    setDisplayClose(true);
    setCurrentSlide(slide);
    setRunId(new Date().toISOString());
  };

  return (
    <div className="TouchRegion" style={rootStyle} id={regionId}>
      <ErrorBoundary>
        <>
          {currentSlide !== null && (
            <div className="TouchRegionContainer">
              <div className="TouchRegionContent">
                <Slide
                  slide={currentSlide}
                  id={currentSlide.executionId}
                  run={runId}
                  slideDone={slideDone}
                  key={currentSlide.executionId}
                  forwardRef={nodeRefs[currentSlide.executionId]}
                />
              </div>
              <div className="TouchRegionFooter">
                <div className="TouchButtonsContainer">
                  {displayClose && (
                    <div
                      className="TouchButtonClose"
                      onClick={slideDone}
                      onKeyDown={slideDone}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="TouchButtonIcon">
                        <IconClose />
                      </div>
                      <div className="TouchButtonText">LUK</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="TouchButtonsContainer">
            {slides &&
              slides.map((slide) => (
                <div
                  className="TouchButton"
                  key={`button-${slide.executionId}`}
                  onClick={() => startSlide(slide)}
                  onKeyDown={() => startSlide(slide)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="TouchButtonIcon">
                    <IconPointer />
                  </div>
                  <div className="TouchButtonText">
                    {slide.content?.touchRegionButtonText ?? slide.title}
                  </div>
                </div>
              ))}
          </div>
        </>
      </ErrorBoundary>
    </div>
  );
}

TouchRegion.propTypes = {
  region: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    gridArea: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default TouchRegion;
