import { React, useEffect } from "react";
import PropTypes from "prop-types";
import "./slide.scss";
import ErrorBoundary from "./error-boundary";
import { useRemoteComponent } from "../use-remote-component";
import logger from "../logger/logger";

/**
 * Slide component.
 *
 * @param {object} props - Props.
 * @param {object} props.slide - The slide data.
 * @param {string} props.id - The unique slide id.
 * @param {number} props.run - Timestamp for when to run the slide.
 * @param {Function} props.slideDone - The function to call when the slide is done running.
 * @param {React.ForwardRefRenderFunction} props.forwardRef - The ref for the slide.
 * @param {string|null} props.errorTimestamp - Slide error timestamp.
 * @param {Function} props.slideError - Callback when slide encountered an error.
 * @returns {object} - The component.
 */
function Slide({
  slide,
  id,
  run,
  slideDone,
  forwardRef,
  errorTimestamp = null,
  slideError,
}) {
  const [loading, err, Component] = useRemoteComponent(
    // errorTimestamp ensures reload of component in case of error.
    slide.templateData.resources.component +
      (errorTimestamp !== null ? `?e=${errorTimestamp}` : "")
  );

  /**
   * Handle errors in ErrorBoundary.
   *
   * Call slideDone after a timeout to ensure progression.
   */
  const handleError = () => {
    logger.warn("Slide error boundary triggered.");

    setTimeout(() => {
      slideError(slide);
    }, 5000);
  };

  useEffect(() => {
    if (err) {
      logger.warn("Remote component loading error.");

      setTimeout(() => {
        slideError(slide);
      }, 5000);
    }
  }, [err]);

  return (
    <>
      {!loading && err && !Component && (
        <h2 className="frontpage-error">ER201</h2>
      )}
      {!loading && !err && Component && (
        <div
          id={id}
          className="slide"
          ref={forwardRef}
          data-run={run}
          data-execution-id={slide.executionId}
        >
          <ErrorBoundary errorHandler={handleError}>
            <Component
              slide={slide}
              content={slide.content}
              run={run}
              slideDone={slideDone}
              executionId={slide.executionId}
            />
          </ErrorBoundary>
        </div>
      )}
    </>
  );
}

Slide.propTypes = {
  id: PropTypes.string.isRequired,
  run: PropTypes.string.isRequired,
  slideDone: PropTypes.func.isRequired,
  slideError: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    executionId: PropTypes.string,
    templateData: PropTypes.shape({
      resources: PropTypes.shape({ component: PropTypes.string.isRequired }),
    }).isRequired,
    content: PropTypes.oneOfType([
      PropTypes.objectOf(PropTypes.any),
      PropTypes.array,
    ]).isRequired,
  }).isRequired,
  errorTimestamp: PropTypes.string,
  forwardRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
};

export default Slide;
