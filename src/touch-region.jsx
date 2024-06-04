import { React, useEffect, useState, createRef } from "react";
import PropTypes from "prop-types";
import "./touch-region.scss";
import { createGridArea } from "os2display-grid-generator";
import Slide from "./slide";
import ErrorBoundary from "./error-boundary";
import idFromPath from "./id-from-path";
import IconClose from "./assets/icon-close.svg?react";
import IconPointer from "./assets/icon-pointer.svg?react";

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
  const regionId = idFromPath(region["@id"]);

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
    const slideDoneEvent = new CustomEvent("slideDone", {
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
      const event = new CustomEvent("regionRemoved", {
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
    const event = new CustomEvent("regionReady", {
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
    <div className="touch-region" style={rootStyle} id={regionId}>
      <ErrorBoundary>
        <>
          {currentSlide !== null && (
            <div className="touch-region-container">
              <div className="touch-region-content">
                <Slide
                  slide={currentSlide}
                  id={currentSlide.executionId}
                  run={runId}
                  slideDone={slideDone}
                  key={currentSlide.executionId}
                  forwardRef={nodeRefs[currentSlide.executionId]}
                />
              </div>
              <div className="touch-region-footer">
                <div className="touch-buttons-container">
                  {displayClose && (
                    <div
                      className="touch-button-close"
                      onClick={slideDone}
                      onKeyDown={slideDone}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="touch-button-icon">
                        <IconClose />
                      </div>
                      <div className="touch-button-text">LUK</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="touch-buttons-container">
            {slides &&
              slides.map((slide) => (
                <div
                  className="touch-button"
                  key={`button-${slide.executionId}`}
                  onClick={() => startSlide(slide)}
                  onKeyDown={() => startSlide(slide)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="touch-button-icon">
                    <IconPointer />
                  </div>
                  <div className="touch-button-text">
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
    "@id": PropTypes.string.isRequired,
    gridArea: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default TouchRegion;
