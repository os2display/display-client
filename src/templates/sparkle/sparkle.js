import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseSlideExecution from '../baseSlideExecution';
import { ReactComponent as InstagramLogo } from './instagram-logo.svg';
import { ReactComponent as Shape } from './shape.svg';
import dayjs from 'dayjs';
import localeDa from 'dayjs/locale/da';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import './sparkle.scss';

/**
 * Book review component.
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
function Sparkle({ slide, content, run, slideDone }) {
  const { posts } = content;
  const [first] = posts;
  const [currentPost, setCurrentPost] = useState(first);
  // Props from content and post.
  const { text, textMarkup, mediaUrl, username, createdTime, videoUrl } = currentPost;
  let { duration, hashtagText, imageWidth } = content;
  duration = duration ? duration : 15000;
  imageWidth = imageWidth ? imageWidth : 56.25;

  dayjs.extend(localizedFormat);
  dayjs.extend(relativeTime)
  // console.log(dayjs().from(dayjs('1990-01-01')))


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

        {!videoUrl && <div className="image" style={{
          backgroundImage: `url("${mediaUrl}")`,
          width: `${imageWidth}%`,
          ...(show
            ? { animation: `fade-in ${animationDuration}ms` }
            : { animation: `fade-out ${animationDuration}ms` })
        }}></div>}
        {videoUrl && <div style={{ width: `${imageWidth}%` }} class="sparkle--video-player-container">
          <video muted="muted" autoplay="autoplay">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>}
        <div className="sparkle-author-section" style={{ width: `${100 - imageWidth}%` }}>
          <h1>{username}</h1>
          <p>{text}</p>
          <p>{dayjs(createdTime).locale(localeDa).fromNow()}</p>
        </div>
        <div className="sparkle-brand">
          {/* todo make this themeable */}
          <InstagramLogo className="sparkle-brand-insta-icon" style={{ fill: 'white' }} />
          <span style={{ color: 'red' }} className="sparkle-brand-insta-tag">{hashtagText}</span>
        </div>
        <div className="sparkle-background--shape">
          <Shape style={{ fill: 'black' }}></Shape>
        </div>
      </div>
    </>
  );
}


Sparkle.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({
    posts: PropTypes.arrayOf(PropTypes.shape({ quote: PropTypes.string, author: PropTypes.string })),
  }).isRequired
};

export default Sparkle;
