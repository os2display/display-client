import { React } from 'react';
import PropTypes from 'prop-types';
import TextBox from './templates/text-box/text-box';
import Slideshow from './templates/slideshow/slideshow';
import Calendar from './templates/calendar/calendar';
import BookReview from './templates/book-review/book-review';
import MeetingRoomSchedule from './templates/meeting-room-schedule/meeting-room-schedule';
import './slide.scss';

/**
 * Slide component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.slide
 *   The slide data.
 * @param {string} props.id
 *   The unique slide id.
 * @param {boolean} props.run
 *   Whether or not the slide should run.
 * @param {Function} props.slideDone
 *   The function to call when the slide is done running.
 * @returns {JSX.Element}
 *   The component.
 */
function Slide({ slide, id, run, slideDone }) {
  let slideComponent;

  if (slide.template === 'template-text-box') {
    slideComponent = <TextBox slide={slide} content={slide.content} run={run} slideDone={slideDone} />;
  } else if (slide.template === 'template-slideshow') {
    slideComponent = <Slideshow slide={slide} content={slide.content} run={run} slideDone={slideDone} />;
  } else if (slide.template === 'template-calendar') {
    slideComponent = <Calendar slide={slide} content={slide.content} run={run} slideDone={slideDone} />;
  } else if (slide.template === 'template-book-review') {
    slideComponent = <BookReview slide={slide} content={slide.content} run={run} slideDone={slideDone} />;
  } else if (slide.template === 'template-meeting-room-schedule') {
    slideComponent = <MeetingRoomSchedule slide={slide} content={slide.content} run={run} slideDone={slideDone} />;
  } else {
    slideComponent = <>Unknown template</>;
  }

  const styles = {};
  if (!run) {
    styles.display = 'none';
  }

  // @TODO: Load template.
  return (
    <div className="Slide" id={id} style={styles}>
      {slideComponent}
    </div>
  );
}

Slide.propTypes = {
  id: PropTypes.string.isRequired,
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    template: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    instanceId: PropTypes.string.isRequired,
    content: PropTypes.objectOf(PropTypes.any).isRequired
  }).isRequired
};

export default Slide;
