import { React } from 'react';
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
  const classes = `template-calendar ${content.backgroundColor}`;

  const capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const date = capitalize(moment().locale('da').format('llll'));

  return (
    <div className={classes}>
      <div className="grid-container-title-date">
        <div className="grid-item">{content.title}</div>
        <div className="grid-item-end">{date}</div>
      </div>
      <div className="grid-container">
        <div className="grid-item" key={1}>Hvad</div>
        <div className="grid-item" key={2}>Hvornår</div>
        <div className="grid-item" key={3}>Hvor</div>
        {content.entries.map((entry) => (
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
    backgroundColor: PropTypes.string.isRequired
  }).isRequired
};

export default Calendar;
