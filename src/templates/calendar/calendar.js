import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './calendar.scss';
import moment from 'moment';
import 'moment/locale/da';
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
  const { backgroundColor, hasDateAndTime, title, entries } = content;
  const classes = `template-calendar ${backgroundColor}`;

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
      setDate(capitalize(moment().locale('da').format('llll')));
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
        {entries.map((entry) => (
          <>
            <div className="grid-item" key={entry.what}>
              {entry.what}
            </div>
            <div className="grid-item" key={entry.when}>
              {moment(entry.when).locale('da').format('LT')}
            </div>
            <div className="grid-item" key={entry.where}>
              {entry.where}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

Calendar.propTypes = {
  content: PropTypes.shape({
    entries: PropTypes.arrayOf(
      PropTypes.shape({
        what: PropTypes.string.isRequired,
        when: PropTypes.string.isRequired,
        where: PropTypes.string.isRequired
      })
    ),
    title: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    hasDateAndTime: PropTypes.bool
  }).isRequired
};

export default Calendar;