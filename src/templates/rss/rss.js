import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import BaseSlideExecution from '../baseSlideExecution';
import dayjs from 'dayjs';
import localeDa from 'dayjs/locale/da';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import "./rss.scss"

/**
 * RSS component.
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
 * @returns {Object}
 *   The component.
 */
function RSS({ slide, content, run, slideDone }) {
  const { source, rssDuration, rssNumber } = content;
  const [currentRSS, setCurrentRSS] = useState([]);
  const [feed, setFeed] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [index, setIndex] = useState(1);

  /**
 * Capitalize the datestring, as it starts with the weekday.
 *
 * @param {string} s
 *    The string to capitalize.
 * @returns {string}
 *    The capitalized string.
 */
  const capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /**
   * Fetch data.
   */
  useEffect(() => {
    fetch(source)
      .then((response) => response.json())
      .then(({ feed }) => {
        setFeed(feed.slice(0, rssNumber))
        const [first] = feed;
        setDataLoaded(true)
        setCurrentRSS(first)
      })
  }, []);

  /**
   * Imports language strings, sets localized formats
   */
  useEffect(() => {
    dayjs.extend(localizedFormat);

    // import('./lang/da.json').then((data) => {
    //   setTranslations(data);
    // });

  }, []);

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
    let timer;
    if (dataLoaded) {
      timer = setTimeout(() => {
        const currentIndex = feed.indexOf(currentRSS);
        const nextIndex = (currentIndex + 1) % feed.length;
        setIndex(nextIndex + 1)
        setCurrentRSS(feed[nextIndex]);
      }, rssDuration * 1000);
    }

    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }

    };
  }, [currentRSS]);
  {/* Todo theme the color of the below */ }
  let { title, date, description } = currentRSS;
  return (
    <div className="rss-slide" style={{ backgroundColor: "aliceblue", color: "navy" }}>
      <div className="progress">slide {index} / {feed.length}</div>
      <div className="title">{title}</div>
      {date && <div className="date">{capitalize(dayjs(date).locale(localeDa).format('LLLL'))}</div>}
      <div className="description">{description}</div>
    </div>);
}

RSS.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired,
  }).isRequired,
  content: PropTypes.shape({
    source: PropTypes.string.isRequired,
  }).isRequired,
};

export default RSS;
