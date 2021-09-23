import { React } from 'react';
import PropTypes from 'prop-types';
import {
  createRemoteComponent,
  createRequires,
} from '@paciolan/remote-component';
import Slideshow from './templates/slideshow/slideshow';
import Calendar from './templates/calendar/calendar';
import BookReview from './templates/book-review/book-review';
import Quote from './templates/quote/quote';
import MeetingRoomSchedule from './templates/meeting-room-schedule/meeting-room-schedule';
import Poster from './templates/poster/poster';
import Sparkle from './templates/sparkle/sparkle';
import Transition from './transition';
import RSS from './templates/rss/rss';
import './slide.scss';
import { resolve } from './remote-component.config';

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
 * @param {boolean} props.isNextSlide
 *   A boolean indicating whether this is the next slide.
 * @param {number} props.prevSlideDuration
 *   The previous slide duration.
 * @returns {object}
 *   The component.
 */
function Slide({ slide, id, run, slideDone, isNextSlide, prevSlideDuration }) {
  const requires = createRequires(resolve);
  const RemoteComponent = createRemoteComponent({ requires });

  const slideComponent = (
    <RemoteComponent
      url={slide.templateData.resources.component}
      slide={slide}
      content={slide.content}
      run={run}
      slideDone={slideDone}
    />
  );

  const styles = {};
  let classes = 'Slide';
  if (!run && !isNextSlide) {
    classes = `${classes} invisible`;
  }

  if (run) {
    styles.zIndex = 1;
  }

  if (isNextSlide) {
    styles.zIndex = -1;
  }

  // @TODO: Load template.
  return (
    <>
      {slideComponent && (
        <div id={id} style={styles} className={classes}>
          <Transition
            run={run}
            duration={slide.duration}
            prevSlideDuration={prevSlideDuration}
            isNextSlide={isNextSlide}
          >
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
    templateData: PropTypes.shape({
      templateKey: PropTypes.string.isRequired,
      resources: PropTypes.shape({ component: PropTypes.string.isRequired }),
    }).isRequired,
    duration: PropTypes.number.isRequired,
    instanceId: PropTypes.string.isRequired,
    content: PropTypes.objectOf(PropTypes.any).isRequired,
  }).isRequired,
  isNextSlide: PropTypes.bool.isRequired,
  prevSlideDuration: PropTypes.number.isRequired,
};

export default Slide;
