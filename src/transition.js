import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './transition.scss';

/**
 * Transition component.
 *
 * @param {object} props
 *   Props.
 * @param {number} props.duration
 *   The slide duration.
 * @param {boolean} props.run
 *   Whether or not the slide, and transition, should start running.
 * @param {JSX.Element} props.children
 *   The children to be rendered.
 * @returns {JSX.Element}
 *   The component.
 */
const Transition = ({ duration, run, children }) => {
  const [animation, setAnimation] = useState('fadeIn');
  const animationDuration = 500;

    /**
   * Setup timer for animation.
   */
  useEffect(() => {
    let timer = null;
    if (run) {
      timer = setTimeout(() => {
        setAnimation('fadeOut');
      }, duration - animationDuration);
    }
    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, []);

  return (
    <div className="transition-component" style={{ animation: `${animation} ${animationDuration}ms` }}>
      {children}
    </div>
  );
};
Transition.propTypes = {
  duration: PropTypes.number.isRequired,
  run: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

export default Transition;
