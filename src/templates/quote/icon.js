import { React } from 'react';
import PropTypes from 'prop-types';

/**
 * @param {object} props
 *   Props.
 * @param  {string} props.stroke
 *   The stroke color.
 * @param {number} props.strokeWidth
 *   The stroke width.
 * @param {string} props.className
 *   The class name.
 * @returns {JSX.Element}
 *   The component.
 */
function Icon({ stroke, strokeWidth, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="28" className={className} viewBox="0 0 38 28">
      <path
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        d="M15,42.5 L22.5,42.5 L27.5,32.5 L27.5,17.5 L12.5,17.5 L12.5,32.5 L20,32.5 L15,42.5 Z M35,42.5 L42.5,42.5 L47.5,32.5 L47.5,17.5 L32.5,17.5 L32.5,32.5 L40,32.5 L35,42.5 Z"
        transform="translate(-11 -16)"
      />
    </svg>
  );
}

Icon.propTypes = {
  stroke: PropTypes.string.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  className: PropTypes.string.isRequired
};

export default Icon;
