import { React, useEffect } from 'react';
import PropTypes from 'prop-types';
import './quote.scss';
import BaseSlideExecution from '../baseSlideExecution';

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
function Quote({ slide, content, run, slideDone }) {

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

  return (
    <>
      <div className="template-quote">
asdf
      </div>
    </>
  );
}

const imageShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

Quote.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({

  }).isRequired
};

export default BookReview;
