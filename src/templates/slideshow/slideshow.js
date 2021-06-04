import { React, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import './slideshow.scss';

function Slideshow({ content }) {
  const { images, transitions, animations, logo } = content;
  const logoClasses = `logo ${logo.position} ${logo.size}`;
  const [index, setIndex] = useState(0);
  const [Image, setImage] = useState();
  const timeoutRef = useRef(null);
  const classes = `image ${transitions} ${animations}`;

  /**
   * A random function to simplify the code where random is used
   *
   * @param {number} multiplier
   */
  function random(multiplier) {
    return Math.floor(Math.random() * multiplier);
  }

  /**
   * Creates the animation using keyframes from styled components
   *
   * @param {boolean} grow
   * @param {string} transform
   */
  function createAnimation(grow, transform) {
    const transformOrigin = transform || '50% 50%';
    const startSize = grow ? 1 : 1.2;
    const finishSize = grow ? 1.2 : 1;
    const startFinishOpacity = transitions === 'fade' ? 0 : 1;
    return keyframes`
    0% {
      transform: scale(${startSize});
      transform-origin: ${transformOrigin};
      opacity: ${startFinishOpacity};
    }
    5% {
      transform: scale(${startSize});
      transform-origin: ${transformOrigin};
      opacity: 1;
    }
    95% {
      transform: scale(${finishSize});
      transform-origin: ${transformOrigin};
      opacity: 1;
    }
    100% {
      transform: scale(${finishSize});
      transform-origin: ${transformOrigin};
      opacity: ${startFinishOpacity};
    }
  `;
  }

  /**
   * Determines which animation should be used
   *
   * @param {string} animationType
   */
  function getCurrentAnimation(animationType) {
    const animationTypes = ['zoom-in-middle', 'zoom-out-middle', 'zoom-out-random', 'zoom-in-random'];
    const randomPercent = `${random(100) + 1}% ${random(100) + 1}%`;
    switch (animationType) {
      case 'zoom-in-middle':
        return createAnimation(true);
      case 'zoom-out-middle':
        return createAnimation(false);
      case 'zoom-in-random':
        return createAnimation(true, randomPercent);
      case 'zoom-out-random':
        return createAnimation(false, randomPercent);
      default:
        return getCurrentAnimation(animationTypes[random(animationTypes.length)]);
    }
  }

  /**
   * Creates a slide with the animation.
   */
  function createImage() {
    const image = styled.div`
      background-image: url(${images[index].url});
      animation-name: ${getCurrentAnimation(animations)};
      animation-duration: ${images[index].duration / 1000}s;
      animation-iteration-count: infinite;
    `;
    setImage(image);
  }

  /**
   * Reset the timeout.
   */
  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  useEffect(() => {
    // Create slides and reset the timeout.
    createImage();
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, images[index].duration);
    return () => {
      resetTimeout();
    };
  }, [index]);

  return (
    <div className="template-slideshow">
      {Image && <Image className={classes} />}
      {logo && <img className={logoClasses} alt="slide" src={logo.url} />}
    </div>
  );
}

Slideshow.propTypes = {
  content: PropTypes.shape({
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired
      })
    ),
    logo: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        position: PropTypes.string,
        size: PropTypes.string
      })
    ),
    animations: PropTypes.string,
    transitions: PropTypes.string
  }).isRequired
};

export default Slideshow;
