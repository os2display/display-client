import { React } from 'react';
import PropTypes from 'prop-types';
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


  return (
    <div className="template-sparkle">
     Sparkle!
    </div>
  );
}


Sparkle.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({
  }).isRequired
};

export default Sparkle;
