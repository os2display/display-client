import { React, useEffect, useState, createRef } from 'react';
import PropTypes from 'prop-types';
import './touch-region.scss';
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
function TouchRegion({ region }) {
  const [slides, setSlides] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(null);
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
    setCurrentSlide(slide);
    setRunId(new Date().toISOString());
  };

  return (
    <div className="TouchRegion" style={rootStyle} id={regionId}>
      <ErrorBoundary>
        <>
          <TransitionGroup component={null}>
            {currentSlide !== null && (
              <CSSTransition
                key={currentSlide.executionId}
                timeout={300}
                classNames="TouchSlide"
                nodeRef={nodeRefs[currentSlide.executionId]}
              >
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
                    <div className="touch-buttons m-3">
                      <div className="touch-buttons--button no-border">
                        <div
                          className="touch-buttons--button-content"
                          onClick={slideDone}
                        >
                          <div className="touch-buttons--button-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="52"
                              height="52"
                              viewBox="0 0 52 52"
                            >
                              <g
                                fill="none"
                                fillRule="evenodd"
                                stroke="#EE0043"
                                strokeWidth="2"
                                transform="translate(1 1)"
                              >
                                <circle cx="25" cy="25" r="25" />
                                <path
                                  strokeLinecap="square"
                                  d="M14.5,13.5 L36.0522621,35.0522621"
                                />
                                <path
                                  strokeLinecap="square"
                                  d="M14.5,13.5 L36.0522621,35.0522621"
                                  transform="matrix(-1 0 0 1 51 0)"
                                />
                              </g>
                            </svg>
                          </div>
                          <div className="touch-buttons--button-text">LUK</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CSSTransition>
            )}
            <div className="touch-buttons">
              {slides &&
                slides.map((slide) => (
                  <div
                    className="touch-buttons--button"
                    key={`button-${slide.executionId}`}
                  >
                    <div
                      className="touch-buttons--button-content"
                      onClick={() => startSlide(slide)}
                    >
                      <div className="touch-buttons--button-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="37"
                          height="48"
                          viewBox="0 0 37 48"
                        >
                          <path
                            fill="none"
                            stroke="#EE0043"
                            strokeWidth="2"
                            d="M19.75,12.625 L19.75,22.2894689 L18.193716,21.2476589 C15.3295041,19.3302939 13.5833333,16.1321102 13.5833333,12.625 C13.5833333,6.88521525 18.2185486,2.25 23.9583333,2.25 C29.6981181,2.25 34.3333333,6.88521525 34.3333333,12.625 C34.3333333,16.1321102 32.5871626,19.3302939 29.7229507,21.2476589 L28.1666667,22.2894689 L28.1666667,12.625 C28.1666667,10.3022847 26.2810486,8.41666667 23.9583333,8.41666667 C21.6356181,8.41666667 19.75,10.3022847 19.75,12.625 Z M39.6672242,29.1531424 C41.149795,29.784751 42.1458333,31.279716 42.1458333,32.9375 C42.1458333,33.1070191 42.132559,33.2264885 42.0941912,33.495062 L40.5305034,44.4823361 C40.2247164,46.5116502 38.5818385,48 36.5416667,48 L22.3958333,48 C21.2957191,48 20.2447516,47.5547985 19.4803932,46.7904401 L8.486053,35.7960999 L9.18429341,35.089021 L10.8345599,33.4178932 C11.4530768,32.7993763 12.2948326,32.4375 13.1875,32.4375 C13.3658378,32.4375 13.4830679,32.4521538 13.6968041,32.4893253 C13.7611548,32.5005167 13.7861733,32.5045519 13.8929353,32.5213293 L19.8333333,33.7682933 L19.8333333,12.625 C19.8333333,10.3435486 21.6768819,8.5 23.9583333,8.5 C26.2397847,8.5 28.0833333,10.3435486 28.0833333,12.625 L28.0833333,24.125 L28.6666667,24.125 C29.1842129,24.125 29.6876691,24.2298867 30.2373021,24.4589521 L39.6672242,29.1531424 Z"
                            transform="translate(-7 -1)"
                          />
                        </svg>
                      </div>
                      <div className="touch-buttons--button-text">
                        {slide.content?.touchRegionButtonText ?? slide.title}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TransitionGroup>
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
