import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { IntlProvider, FormattedMessage } from 'react-intl';
import localeDa from 'dayjs/locale/da';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import './meeting-room-schedule.scss';

/**
 * Meeting room schedule component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.content
 *   The meeting room schedule content.
 * @returns {JSX.Element}
 *   The component.
 */
function MeetingRoomSchedule({ content }) {
  dayjs.extend(localizedFormat);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { backgroundColor, events, title, metaData, textAlign, backgroundImage } = content;
  const [translations, setTranslations] = useState();
  const occupiedText = content.occupiedText ? (
    content.occupiedText
  ) : (
    <FormattedMessage id="occupiedText" defaultMessage="occupiedText" />
  );
  const rootClasses = `template-meeting-room-schedule ${textAlign}`;

  /**
   * Imports language strings.
   */
  useEffect(() => {
    import('./lang/da.json').then((data) => {
      setTranslations(data);
    });
  }, []);

  const rootStyle = {};

  // Set background image or background color.
  if (backgroundImage) {
    rootStyle.backgroundImage = `url("${backgroundImage.url}")`;
  }

  if (backgroundColor) {
    rootStyle.backgroundColor = backgroundColor;
  }

  /**
   * Returns if an event is now and should be highligted.
   *
   * @param {object} event
   *    The event object.
   * @returns {string}
   *    The classes to return.
   */
  function isNow(event) {
    if (new Date().getTime() > new Date(event.from).getTime() && new Date(event.to).getDay() < new Date().getTime()) {
      return 'flex-item now';
    }
    return 'flex-item';
  }

  /**
   * Setup date interval.
   */
  useEffect(() => {
    let timer = null;
    timer = setInterval(() => setCurrentDate(new Date()), 5000);
    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, []);

  // Sort events by from and filter away events that are done, but not ongoing events.
  const sortedEvents = events
    .filter((e) => {
      return new Date(e.to).getTime() > new Date().getTime() && new Date(e.to).getDay() === new Date().getDay();
    })
    .sort((a, b) => a.from.localeCompare(b.from));

  return (
    <IntlProvider messages={translations} locale="da" defaultLocale="da">
      <div className={rootClasses} style={rootStyle}>
        <div className="header">
          {title && <h1>{title}</h1>}
          {metaData && <p>{metaData}</p>}
          {sortedEvents.length === 0 && <FormattedMessage id="available" defaultMessage="available" />}
        </div>
        {sortedEvents.length > 0 && (
          <div className="flex-container">
            {currentDate &&
              sortedEvents.map((event) => (
                <div className={isNow(event)} key={event.id}>
                  <div className="time">
                    {dayjs(event.from).locale(localeDa).format('LT')} - {dayjs(event.to).locale(localeDa).format('LT')}
                  </div>
                  <div className="event-name">{event.eventName ? event.eventName : occupiedText}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </IntlProvider>
  );
}
MeetingRoomSchedule.propTypes = {
  content: PropTypes.shape({
    availableText: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    backgroundImage: PropTypes.shape({
      id: PropTypes.string,
      url: PropTypes.string
    }),
    events: PropTypes.arrayOf(
      PropTypes.shape({
        eventName: PropTypes.string,
        from: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        to: PropTypes.string.isRequired
      }).isRequired
    ).isRequired,
    occupiedText: PropTypes.string.isRequired,
    metaData: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    textAlign: PropTypes.string.isRequired
  }).isRequired
};
export default MeetingRoomSchedule;
