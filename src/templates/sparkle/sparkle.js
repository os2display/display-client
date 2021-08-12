import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import localeDa from 'dayjs/locale/da';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { ReactComponent as Shape } from './shape.svg';
import { ReactComponent as InstagramLogo } from './instagram-logo.svg';
import BaseSlideExecution from '../baseSlideExecution';
import './sparkle.scss';

/**
 * Sparkle component.
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
 * @returns {object}
 *   The component.
 */
function Sparkle({ slide, content, run, slideDone }) {
  // TODO what does horizontal/portrait/vertical do? Ask Troels!
  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime);

  // Posts
  const { posts } = content;
  const [first] = posts;
  const [currentPost, setCurrentPost] = useState(first);

  // Props from content and post.
  const { textMarkup, mediaUrl, username, createdTime, videoUrl } = currentPost;
  // TODO should duration depend on number of instagram posts to show? Ask Troels!
  let { duration, imageWidth } = content;
  const { hashtagText } = content;
  duration = duration || 15000; // Add a default
  imageWidth = imageWidth || 56.25; // Add a default
  const sanitizedTextMarkup = DOMPurify.sanitize(textMarkup);

  // Animation
  const [show, setShow] = useState(true);
  const animationDuration = 1500;

  /**
   * Setup slide run function.
   */
  const slideExecution = new BaseSlideExecution(slide, slideDone);
  useEffect(() => {
    if (run) {
      slideExecution.start(slide.duration);
    } else {
      slideExecution.stop();
    }
  }, [run]);

  /**
   * Setup post switch and animation, if there is more than one post.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentIndex = posts.indexOf(currentPost);
      const nextIndex = (currentIndex + 1) % posts.length;
      setCurrentPost(posts[nextIndex]);
      setShow(true);
    }, duration);

    const animationTimer = setTimeout(() => {
      setShow(false);
    }, duration - animationDuration);

    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }
      if (animationTimer !== null) {
        clearInterval(animationTimer);
      }
    };
  }, [currentPost]);

  return (
    <>
      <div className={show ? 'template-sparkle show' : 'template-sparkle hide'}>
        {!videoUrl && (
          <div
            className="image"
            style={{
              backgroundImage: `url("${mediaUrl}")`,
              width: `${imageWidth}%`,
              ...(show
                ? { animation: `fade-in ${animationDuration}ms` }
                : { animation: `fade-out ${animationDuration}ms` }),
            }}
          />
        )}
        {videoUrl && (
          <div style={{ width: `${imageWidth}%` }} className="video-container">
            <video muted="muted" autoPlay="autoplay">
              <source src={videoUrl} type="video/mp4" />
              <track kind="captions" />
            </video>
          </div>
        )}
        <div
          className="author-section"
          style={{ width: `${100 - imageWidth}%` }}
        >
          <h1>{username}</h1>
          <p>{parse(sanitizedTextMarkup)}</p>
          <p>{dayjs(createdTime).locale(localeDa).fromNow()}</p>
        </div>
        <div className="shape">
          <Shape style={{ fill: 'black' }} />
        </div>
        <div className="brand">
          {/* todo make this themeable */}
          <InstagramLogo className="brand-icon" style={{ fill: 'white' }} />
          <span style={{ color: 'red' }} className="brand-tag">
            {hashtagText}
          </span>
        </div>
      </div>
    </>
  );
}

Sparkle.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired,
  }).isRequired,
  content: PropTypes.shape({
    hashtagText: PropTypes.string,
    imageWidth: PropTypes.number,
    duration: PropTypes.number,
    posts: PropTypes.arrayOf(
      PropTypes.shape({ quote: PropTypes.string, author: PropTypes.string })
    ),
  }).isRequired,
};

export default Sparkle;
