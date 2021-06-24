import { React } from 'react';
import PropTypes from 'prop-types';
import TextBox from './templates/text-box/text-box';
import Slideshow from './templates/slideshow/slideshow';
import Calendar from './templates/calendar/calendar';
import BookReview from './templates/book-review/book-review';
import MeetingRoomSchedule from './templates/meeting-room-schedule/meeting-room-schedule';
import Transition from './transition';
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
 * @param {boolean} props.nextSlide
 *  A boolean indication whether this is the next slide.
 * @param {number} props.prevSlideDuration
 *  The previous slide duration.
 * @returns {JSX.Element}
 *   The component.
 */
function Slide({ slide, id, run, slideDone, nextSlide, prevSlideDuration }) {
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
  if (!run && !nextSlide) {
    styles.display = 'none';
  }

  if (run) {
    styles.zIndex = 1;
  }

  // @TODO: Load template.
  return (
    <>
      {slideComponent && (
        <div className="Slide" id={id} style={styles}>
          <Transition run={run} duration={slide.duration} prevSlideDuration={prevSlideDuration} isNextSlide={nextSlide}>
            {slideComponent}
          </Transition>
        </div>
      )}
    </>
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
  }).isRequired,
  nextSlide: PropTypes.bool.isRequired,
  prevSlideDuration: PropTypes.number.isRequired
};

export default Slide;
