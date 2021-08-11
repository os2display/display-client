import { React } from 'react';
import PropTypes from 'prop-types';
import { createGrid } from 'os2display-grid-generator';
import Region from './region';
import './screen.scss';

/**
 * Screen component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.screen
 *   The screen data.
 * @returns {JSX.Element}
 *   The component.
 */
function Screen({ screen }) {
  const configColumns = screen.grid?.columns || 1;
  const configRows = screen.grid?.rows || 1;
  const rootStyle = {
    gridTemplateAreas: createGrid(configColumns, configRows),
  };

  return (
    <div className="Screen" style={rootStyle}>
      {screen?.regions?.length > 0 &&
        screen.regions.map((region) => (
          <Region key={region.id} region={region} />
        ))}
    </div>
  );
}

Screen.propTypes = {
  screen: PropTypes.shape({
    regions: PropTypes.arrayOf(PropTypes.any).isRequired,
    grid: PropTypes.shape({
      columns: PropTypes.number.isRequired,
      rows: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Screen;
