import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import localeDa from 'dayjs/locale/da'; // With a custom alias for the locale object
import localizedFormat from 'dayjs/plugin/localizedFormat';
import './calendar.scss';

/**
 * Slideshow component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.content
 *   The slide content.
 * @returns {JSX.Element}
 *   The component.
 */
function Calendar({ content }) {
  dayjs.extend(localizedFormat);

  const { backgroundColor, hasDateAndTime, title, events } = content;
  const classes = `template-calendar ${backgroundColor}`;
  // Sort events by datetime and filter away events that are done.
  let sortedEvents = events.filter(function (e) {
    return new Date(e.datetime).getTime() > new Date().getTime();
  }).sort((a, b) => a.datetime.localeCompare(b.datetime));

  /**
   * Creates and updates the datestring.
   *
   * @returns {string}
   *    Returns an updated datestring.
   */
  function useNewTimer() {
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
    const [date, setDate] = useState();

    /**
     * Updates the date string.
     */
    const displayTime = () => {
      setDate(capitalize(dayjs().locale(localeDa).format('LLLL')));
    };

    /**
     * Has timer, that calls displaytime to update date.
     */
    useEffect(() => {
      displayTime();
      const timer = setInterval(() => displayTime(), 1000);
      return function cleanup() {
        clearInterval(timer);
      };
    });

    return date;
  }

  const date = hasDateAndTime ? useNewTimer() : undefined;

  return (
    <div className={classes}>
      <div className="grid-container-title-date">
        <div className="grid-item">{title}</div>
        <div className="grid-item-end">{date && date}</div>
      </div>
      <div className="grid-container">
        <div className="grid-item" key={1}>
          Hvad
        </div>
        <div className="grid-item" key={2}>
          Hvornår
        </div>
        <div className="grid-item" key={3}>
          Hvor
        </div>
        {sortedEvents.map((entry) => (
          <>
            <div className="grid-item" key={entry.eventName}>
              {entry.eventName}
            </div>
            <div className="grid-item" key={entry.datetime}>
              {dayjs(entry.datetime).locale(localeDa).format('LT')}
            </div>
            <div className="grid-item" key={entry.location}>
              {entry.location}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

Calendar.propTypes = {
  content: PropTypes.shape({
    events: PropTypes.arrayOf(
      PropTypes.shape({
        eventName: PropTypes.string.isRequired,
        datetime: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired
      })
    ),
    title: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    hasDateAndTime: PropTypes.bool
  }).isRequired
};

export default Calendar;
