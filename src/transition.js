import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './transition.scss';

/**
 * Transition component.
 *
 * @param {object} props
 *   Props.
 * @param {boolean} props.run
 *   Whether or not the slide is visible.
 * @param {number} props.duration
 *   The slide duration.
 * @param {number} props.prevSlideDuration
 *   The previous slide duration.
 * @param {boolean} props.isNextSlide
 *   Whether or not the slide is the next slide.
 * @param {object} props.children
 *   The children to be rendered.
 * @returns {object}
 *   The component.
 */
const Transition = ({
  run,
  duration,
  prevSlideDuration,
  isNextSlide,
  children,
}) => {
  const animationDuration = 500;
  const [style, setStyle] = useState({});

  /**
   * Setup timer for animation.
   */
  useEffect(() => {
    let timer = null;

    // If the slide is currently visible, the fadeOut should be prepared.
    if (run) {
      timer = setTimeout(() => {
        setStyle({ animation: `fadeOut ${animationDuration}ms` });
      }, duration - animationDuration);
    }

    // If the slide is the next slide, the fadeIn should be prepared.
    if (isNextSlide) {
      timer = setTimeout(() => {
        setStyle({ animation: `fadeIn ${animationDuration}ms` });
      }, prevSlideDuration - animationDuration);
    }

    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  });

  return (
    <div className="transition-component" style={style}>
      {children}
    </div>
  );
};
Transition.propTypes = {
  run: PropTypes.bool.isRequired,
  duration: PropTypes.number.isRequired,
  prevSlideDuration: PropTypes.number.isRequired,
  isNextSlide: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default Transition;
