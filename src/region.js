import { createRef, React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './region.scss';
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
  const [slideRefs, setSlideRefs] = useState([]);

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
    Logger.log('info', 'Region: Received new data');
    setSlides([...event.detail.slides]);
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
    if (currentInstanceId !== null) {
      const currentSlide = slides.find((slide) => currentInstanceId === slide.instanceId);

      if (slideRefs[currentSlide.executionId]?.current) {
        slideRefs[currentSlide.executionId].current.startSlide();
      }
    }
  }, [currentInstanceId]);

  useEffect(() => {
    if (currentInstanceId === null && slides?.length > 0) {
      const nextSlide = slides[0];
      setCurrentInstanceId(nextSlide.instanceId);
    }

    // Update slideRefs
    setSlideRefs((oldRefs) => {
      const refs = [];
      slides.forEach((slide) => {
        refs[slide.executionId] = oldRefs[slide.executionId] || createRef();
      });

      return refs;
    });
  }, [slides]);

  return (
    <div className="Region">
      {slides &&
        currentInstanceId &&
        slides.map((slide) => (
          <Slide
            slide={slide}
            ref={slideRefs[slide.executionId]}
            id={`${slide.executionId}`}
            slideDone={slideDone}
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
