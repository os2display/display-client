import React, { useEffect, useState } from 'react';
import './transition.scss';
import PropTypes from 'prop-types';

const Transition = ({ show, children }) => {
  const [shouldRender, setRender] = useState(show);

  useEffect(() => {
    if (show) setRender(true);
  }, [show]);

  const onAnimationEnd = () => {
    if (!show) setRender(false);
  };

  return (
    shouldRender && (
      // Todo now it only fades, should have changing transitions
      <div
        className="transition-component"
        style={{ animation: `${show ? 'fadeIn' : 'fadeOut'} 1s` }}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </div>
    )
  );
};

Transition.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
};

export default Transition;
