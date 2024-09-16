import { React } from 'react';
import PropTypes from 'prop-types';
import './slide.scss';
import ErrorBoundary from './error-boundary';
import { useRemoteComponent } from '../useRemoteComponent';

/**
 * Slide component.
 *
 * @param {object} props - Props.
 * @param {object} props.slide - The slide data.
 * @param {string} props.id - The unique slide id.
 * @param {number} props.run - Timestamp for when to run the slide.
 * @param {Function} props.slideDone - The function to call when the slide is done running.
 * @param {React.ForwardRefRenderFunction} props.forwardRef - The ref for the slide.
 * @returns {object} - The component.
 */
function Slide({ slide, id, run, slideDone, forwardRef }) {
  const [loading, err, Component] = useRemoteComponent(
    slide.templateData.resources.component
  );

  /**
   * Handle errors in ErrorBoundary.
   *
   * Call slideDone after a timeout to ensure progression.
   */
  function handleError() {
    setTimeout(() => {
      slideDone(slide);
    }, 2000);
  }

  return (
    <div
      id={id}
      className="slide"
      ref={forwardRef}
      data-run={run}
      data-execution-id={slide.executionId}
    >
      {loading && <div>...</div>}
      {!loading && err == null && Component && (
        <ErrorBoundary errorHandler={handleError}>
          <Component
            slide={slide}
            content={slide.content}
            run={run}
            slideDone={slideDone}
            executionId={slide.executionId}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

Slide.propTypes = {
  id: PropTypes.string.isRequired,
  run: PropTypes.string.isRequired,
  slideDone: PropTypes.func.isRequired,
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
  forwardRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]).isRequired,
};

export default Slide;
