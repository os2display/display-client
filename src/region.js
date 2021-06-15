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

  /**
   * @param {object} slide
   *   The slide.
   */
  // eslint-disable-next-line no-unused-vars
  function slideDone(slide) {
    const slideDoneEvent = new CustomEvent('slideDone', {
      detail: {
        regionId: region.id,
        slideExecutionId: slide.slideExecutionId
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
    setSlides(event.detail.slides);

    setTimeout(() => slideDone(event.detail.slides[0]), event.detail.slides[0].duration);
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

  return (
    <div className="Region">
      {slides &&
        slides.map((slide, index) => (
          <Slide
            slide={slide}
            id={`${slide.slideExecutionId}`}
            key={`${slide.slideExecutionId}`}
            display={index === 0}
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
