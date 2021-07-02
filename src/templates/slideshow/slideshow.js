import { React, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes, Keyframes } from 'styled-components';
import './slideshow.scss';
import BaseSlideExecution from '../baseSlideExecution';

/**
 * Slideshow component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.slide
 *   The slide.
 * @param {object} props.content
 *   The slide content.
 * @param {boolean} props.run
 *   Whether or not the slide should start running.
 * @param {Function} props.slideDone
 *   Function to invoke when the slide is done playing.
 * @returns {JSX.Element}
 *   The component.
 */
function Slideshow({ slide, content, run, slideDone }) {
  const { images, transitions, animations, logo } = content;
  const logoClasses = `logo ${logo.position} ${logo.size}`;
  const [index, setIndex] = useState(0);
  const [Image, setImage] = useState();
  const timeoutRef = useRef(null);
  const classes = `image ${transitions} ${animations}`;

  /**
   * Setup slide run function.
   */
  const slideExecution = new BaseSlideExecution(slide, slideDone);
  useEffect(() => {
    if (run) {
      // @TODO: Make sure each image has been shown the correct duration before transition.
      // Extract duration from content.images.
      let duration = 0;
      images.forEach((image) => {
        // Default to 5 seconds pr. image.
        duration += image.duration > 0 ? image.duration : 5000;
      });

      slideExecution.start(duration !== 0 ? duration : 1000);
    } else {
      slideExecution.stop();
    }
  }, [run]);

  /**
   * A random function to simplify the code where random is used
   *
   * @param {number} multiplier
   *   The multiplier.
   * @returns {number}
   *   Random number.
   */
  function random(multiplier) {
    return Math.floor(Math.random() * multiplier);
  }

  /**
   * Creates the animation using keyframes from styled components
   *
   * @param {boolean} grow
   *   Grow boolean.
   * @param {string} transform
   *   The transform.
   * @returns {Keyframes}
   *   The animation.
   */
  function createAnimation(grow, transform = '50% 50%') {
    const transformOrigin = transform;
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
   *   The animation type.
   * @returns {Keyframes}
   *   The current animation.
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
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({}).isRequired,
  content: PropTypes.shape({
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired
      })
    ),
    logo: PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      position: PropTypes.string,
      size: PropTypes.string
    }),
    animations: PropTypes.string,
    transitions: PropTypes.string
  }).isRequired
};

export default Slideshow;
