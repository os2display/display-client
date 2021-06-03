import { React, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import './slideshow.scss';

function Slideshow({ content }) {
  const { images, transitions, animations, logo } = content;
  const logoClasses = `logo ${logo.position} ${logo.size}`;
  const [index, setIndex] = useState(0);
  const [Slide, setSlide] = useState();
  const timeoutRef = useRef(null);
  const classes = `image ${transitions} ${animations}`;

  // A random function to simplify the code where random is used
  function random(multiplier) {
    return Math.floor(Math.random() * multiplier);
  }

  // Creates the animation using keyframes from styled components
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

  // Determines which animation should be used
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

  // Creates a slide with the animation.
  function createSlide() {
    const slide = styled.div`
      background-image: url(${images[index].url});
      animation-name: ${getCurrentAnimation(animations)};
      animation-duration: ${images[index].duration / 1000}s;
      animation-iteration-count: infinite;
    `;
    setSlide(slide);
  }

  // Reset the timeout.
  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  useEffect(() => {
    // Create slides and reset the timeout.
    createSlide();
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, images[index].duration);
    return () => {
      resetTimeout();
    };
  }, [index]);

  return (
    <div className="slideshow">
      {Slide && <Slide className={classes} />}
      {logo && <img className={logoClasses} alt="slide" src={logo.url} />}
    </div>
  );
}

Slideshow.propTypes = {
  content: PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    images: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    logo: PropTypes.object,
    animations: PropTypes.string,
    transitions: PropTypes.string
  }).isRequired
};

export default Slideshow;
