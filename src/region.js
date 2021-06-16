import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './region.scss';
import uniqBy from 'lodash.uniqby';
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
  const [currentSlideExecutionId, setCurrentSlideExecutionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Play given slide.
   *
   * @param {object} slide
   *   The slide.
   */
  function playSlide(slide) {
    setCurrentSlideExecutionId(slide.slideExecutionId);

    console.log(`Playing: ${slide.slideExecutionId}`);

    // @TODO: Handle slides that have an unknown duration.
    // eslint-disable-next-line no-use-before-define
    setTimeout(() => slideDone(slide), slide.duration);
  }

  /**
   * @param {object} slide
   *   The slide.
   */
  function slideDone(slide) {
    console.log('Slide done');
    console.log(slide);

    const slideDoneEvent = new CustomEvent('slideDone', {
      detail: {
        regionId: region.id,
        slideExecutionId: slide.slideExecutionId
      }
    });
    document.dispatchEvent(slideDoneEvent);

    console.log(`currentSlideExecutionId: ${currentSlideExecutionId}`);
    console.log('fisk');

    console.log(slides);

    let indexOf = slides.findIndex((value) => value.slideExecutionId === currentSlideExecutionId);
    if (indexOf === -1) {
      indexOf = 0;
    }
    console.log(`indexOf: ${indexOf}`);
    console.log(`nextIndex: ${(indexOf + 1) % slides.length}`);
    const nextSlide = slides[(indexOf + 1) % slides.length];

    console.log('nextSlide:');
    console.log(nextSlide);

    playSlide(nextSlide);
  }

  /**
   * Handle region content event.
   *
   * @param {CustomEvent} event
   *   The event. The data is contained in detail.
   */
  // eslint-disable-next-line no-unused-vars
  function regionContentListener(event) {
    setSlides((oldArray) => {
      return uniqBy([...oldArray, ...event.detail.slides]);
    }, 'slideExecutionId');
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
    // @TODO: Handle cleanup of slides.
    setCurrentIndex(0);
  }, [slides]);

  console.log(slides);

  return (
    <div className="Region">
      {slides &&
        slides.map((slide, index) => (
          <Slide
            slide={slide}
            id={`${slide.slideExecutionId}`}
            key={`${slide.slideExecutionId}`}
            display={index === currentIndex}
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
