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
   * Handle region content event.
   *
   * @param {CustomEvent} event
   *   The event. The data is contained in detail.
   */
  function regionContentListener(event) {
    setSlides(event.detail.slides);
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
          <Slide slide={slide} id={`${region.id}-${slide.id}`} key={`${region.id}-${slide.id}`} display={index === 0} />
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
