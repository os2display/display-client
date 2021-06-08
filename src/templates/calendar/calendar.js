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
  return <div>calendar</div>;
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
