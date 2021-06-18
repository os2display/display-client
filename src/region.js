import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './region.scss';
// import uniqBy from 'lodash.uniqby';
import Slide from './slide';
import Logger from './logger/logger';

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
  const [currentInstanceId, setCurrentInstanceId] = useState(null);

  /**
   * @param {object} slide
   *   The slide.
   */
  function slideDone(slide) {
    // Emit slideDone event.
    const slideDoneEvent = new CustomEvent('slideDone', {
      detail: {
        regionId: region.id,
        instanceId: slide.instanceId,
        executionId: slide.executionId
      }
    });
    document.dispatchEvent(slideDoneEvent);

    // Go to next slide.
    setCurrentInstanceId((oldInstanceId) => {
      const slideIndex = slides.findIndex((slideElement) => slideElement.instanceId === oldInstanceId);
      const nextSlide = slides[(slideIndex + 1) % slides.length];
      return nextSlide.instanceId;
    });
  }

  /**
   * Handle region content event.
   *
   * @param {CustomEvent} event
   *   The event. The data is contained in detail.
   */
  function regionContentListener(event) {
    Logger.log('info', 'Region: received new data');
    setSlides([...event.detail.slides]);
    /*
    setSlides((oldArray) => {
      return uniqBy([...oldArray, ...event.detail.slides], 'executionId');
      let newArray = [];

      let addRest = false;
      for (let i = 0; i < oldArray.length; i += 1) {
        const slide = oldArray[i];
        if (addRest) {
          newArray.push(slide);
        } else if (slide.executionId === currentExecutionId) {
          newArray.push(slide);
          addRest = true;
        }
      }

      newArray = uniqBy([...newArray, ...event.detail.slides], 'executionId');

      const newArray = uniqBy([...oldArray, ...event.detail.slides], 'executionId');

      if (currentExecutionId === null && newArray?.length > 0) {
        playSlide(newArray[0]);
      }

      return newArray;
    }, 'slideExecutionId');
      */
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
    Logger.log('info', `Playing: ${currentInstanceId}`);

    if (currentInstanceId !== null) {
      const currentSlide = slides.find((slide) => currentInstanceId === slide.instanceId);

      // @TODO: Move this timeout into Slide.
      setTimeout(() => {
        slideDone(currentSlide);
      }, currentSlide.duration);
    }
  }, [currentInstanceId]);

  useEffect(() => {
    if (currentInstanceId === null && slides?.length > 0) {
      const nextSlide = slides[0];
      setCurrentInstanceId(nextSlide.instanceId);
    }
  }, [slides]);

  return (
    <div className="Region">
      {slides &&
        currentInstanceId &&
        slides.map((slide) => (
          <Slide
            slide={slide}
            id={`${slide.executionId}`}
            key={`${slide.executionId}`}
            display={currentInstanceId === slide.instanceId}
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
