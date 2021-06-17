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
 * @param {boolean} props.display
 *   Whether or not the slide should be shown.
 * @returns {JSX.Element}
 *   The component.
 */
function Slide({ slide, id, display }) {
  let slideComponent;
  if (slide.template === 'template-text-box') {
    slideComponent = <TextBox content={slide.content} />;
  } else if (slide.template === 'template-slideshow') {
    slideComponent = <Slideshow content={slide.content} />;
  } else if (slide.template === 'template-calendar') {
    slideComponent = <Calendar content={slide.content} />;
  } else if (slide.template === 'template-book-review') {
    slideComponent = <BookReview content={slide.content} />;
  } else if (slide.template === 'template-meeting-room-schedule') {
    slideComponent = <MeetingRoomSchedule content={slide.content} />;
  } else {
    slideComponent = <>Unknown template</>;
  }

  const styles = {};
  if (!display) {
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
  display: PropTypes.bool,
  slide: PropTypes.shape({
    template: PropTypes.string.isRequired,
    content: PropTypes.objectOf(PropTypes.any).isRequired
  }).isRequired
};

Slide.defaultProps = {
  display: true
};

export default Slide;
