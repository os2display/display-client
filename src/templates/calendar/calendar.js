import { React } from 'react';
import PropTypes from 'prop-types';
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
  return (
    <div className="template-calendar">
      <div className="grid-container-title-date">
        <div className="grid-item">{content.title}</div>
        <div className="grid-item-end">{content.date}</div>
      </div>
      <div className="grid-container">
      <div className="grid-item">Hvad</div>
      <div className="grid-item">Hvornår</div>
      <div className="grid-item">Hvor</div>
        {content.entries.map((entry) => (
          <>
            <div className="grid-item">{entry.what}</div>
            <div className="grid-item">{entry.when}</div>
            <div className="grid-item">{entry.where}</div>
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
        where: PropTypes.number.isRequired
      })
    ),
    logo: PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      position: PropTypes.string,
      size: PropTypes.string
    }),
    title: PropTypes.string,
    date: PropTypes.string
  }).isRequired
};

export default Calendar;
