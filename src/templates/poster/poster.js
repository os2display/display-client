import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import localeDa from 'dayjs/locale/da';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { IntlProvider, FormattedMessage } from 'react-intl';
import BaseSlideExecution from '../baseSlideExecution';
import './poster.scss';

/**
 * Poster component.
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
function Poster({ slide, content, run, slideDone }) {
  // Translations.
  const [translations, setTranslations] = useState();

  // Events.
  const { events } = content;
  const [first] = events;
  const [currentEvent, setCurrentEvent] = useState(first);

  // Animation.
  const [show, setShow] = useState(true);
  const animationActive = events.length > 1;
  const animationDuration = 500;
  const { duration } = content || 15000; // default 15s.

  // Props from content.
  const { endDate, startDate, name, image, excerpt, ticketPriceRange, readMoreText, url, place } = currentEvent;

  // Dates.
  const singleDayEvent = new Date(endDate).toDateString() === new Date(startDate).toDateString();

  /**
   * Imports language strings, sets localized formats
   * and sets timer.
   */
  useEffect(() => {
    dayjs.extend(localizedFormat);

    import('./lang/da.json').then((data) => {
      setTranslations(data);
    });
  }, []);

  /**
   * Setup event switch and animation, if there is more than one event.
   */
  useEffect(() => {
    let animationTimer;
    let timer;
    if (animationActive) {
      timer = setTimeout(() => {
        const currentIndex = events.indexOf(currentEvent);
        const nextIndex = (currentIndex + 1) % events.length;
        setCurrentEvent(events[nextIndex]);
        setShow(true);
      }, duration);

      animationTimer = setTimeout(() => {
        setShow(false);
      }, duration - animationDuration);
    }
    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }
      if (animationTimer !== null) {
        clearInterval(animationTimer);
      }
    };
  }, [currentEvent]);

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

  return (
    <IntlProvider messages={translations} locale="da" defaultLocale="da">
      <div className="template-poster">
        <div
          className="image-area"
          style={{
            backgroundImage: `url("${image}")`,
            ...(show
              ? { animation: `fade-in ${animationDuration}ms` }
              : { animation: `fade-out ${animationDuration}ms` })
          }}
        />
        {/* todo theme color */}
        <div className="header-area" style={{ backgroundColor: 'Azure' }}>
          <div className="center">
            <h1>{name}</h1>
            <p className="lead">{excerpt}</p>
          </div>
        </div>
        {/* todo theme color */}
        <div className="info-area" style={{ backgroundColor: 'Aquamarine' }}>
          {startDate && endDate && (
            <span>
              {singleDayEvent && (
                <span>
                  <p className="date">{capitalize(dayjs(startDate).locale(localeDa).format('LLLL'))}</p>
                </span>
              )}
              {/* todo if startdate is not equal to enddate */}
              {!singleDayEvent && (
                <span>
                  <p className="date">
                    {capitalize(dayjs(startDate).locale(localeDa).format('LLLL'))} -{' '}
                    {capitalize(dayjs(endDate).locale(localeDa).format('LLLL'))}
                  </p>
                </span>
              )}
            </span>
          )}
          {place && <p className="place">{place.name}</p>}
          {!ticketPriceRange && (
            <p className="ticket">
              <FormattedMessage id="free" defaultMessage="free" />
            </p>
          )}
          {ticketPriceRange && <p className="ticket">{ticketPriceRange}</p>}
          {/* todo theme color link */}
          {readMoreText && url && (
            <p className="moreinfo">
              {readMoreText} <span className="look-like-link">{url}</span>
            </p>
          )}
          {readMoreText && !url && <p className="moreinfo">{readMoreText}</p>}
        </div>
      </div>
    </IntlProvider>
  );
}

Poster.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({
    events: PropTypes.arrayOf(
      PropTypes.shape({
        endDate: PropTypes.string,
        eventStatusText: PropTypes.string,
        excerpt: PropTypes.string,
        image: PropTypes.string,
        name: PropTypes.string,
        place: PropTypes.shape({
          addressLocality: PropTypes.string,
          image: PropTypes.string,
          name: PropTypes.string,
          postalCode: PropTypes.string,
          streetAddress: PropTypes.string,
          telephone: PropTypes.string
        }),
        startDate: PropTypes.string,
        ticketPriceRange: PropTypes.string,
        ticketPurchaseUrl: PropTypes.string,
        url: PropTypes.string
      })
    )
  }).isRequired
};

export default Poster;
