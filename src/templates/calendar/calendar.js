import { React, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import localeDa from 'dayjs/locale/da'; // With a custom alias for the locale object
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { IntlProvider, FormattedMessage } from 'react-intl';
import './calendar.scss';

/**
 * Calendar component.
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

  const [currentDate, setCurrentDate] = useState(null);
  const [translations, setTranslations] = useState();

  const { backgroundColor, hasDateAndTime, title, events } = content;
  const classes = `template-calendar ${backgroundColor}`;

  /**
   * Imports language strings.
   */
  useEffect(() => {
    import('./lang/da.json').then((data) => {
      setTranslations(data);
    });
  }, []);

  /**
   * Setup date interval.
   */
  useEffect(() => {
    let timer = null;
    if (hasDateAndTime) {
      timer = setInterval(() => setCurrentDate(new Date()), 1000);
    }
    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, []);

  // Sort events by datetime and filter away events that are done.
  const sortedEvents = events
    .filter((e) => {
      return (
        new Date(e.datetime).getTime() > new Date().getTime() && new Date(e.datetime).getDay() === new Date().getDay()
      );
    })
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

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
      <div className={classes}>
        <div className="grid-container-title-date">
          <div className="grid-item">{title}</div>
          <div className="grid-item-end">{currentDate && capitalize(dayjs().locale(localeDa).format('LLLL'))}</div>
        </div>
        <div className="grid-container">
          <div className="grid-item" key={1}>
            <FormattedMessage id="what" defaultMessage="what" />
          </div>
          <div className="grid-item" key={2}>
            <FormattedMessage id="when" defaultMessage="when" />
          </div>
          <div className="grid-item" key={3}>
            <FormattedMessage id="where" defaultMessage="where" />
          </div>
          {sortedEvents.map((entry) => (
            <Fragment key={entry.id}>
              <div className="grid-item">{entry.eventName}</div>
              <div className="grid-item">{dayjs(entry.datetime).locale(localeDa).format('LT')}</div>
              <div className="grid-item">{entry.location}</div>
            </Fragment>
          ))}
        </div>
      </div>
    </IntlProvider>
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