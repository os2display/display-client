import { Fragment, React } from 'react';
import PropTypes from 'prop-types';
import { createGrid } from 'os2display-grid-generator';
import Region from './region';
import './screen.scss';
import TouchRegion from './touch-region';

/**
 * Screen component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.screen
 *   The screen data.
 * @returns {object}
 *   The component.
 */
function Screen({ screen }) {
  const configColumns = screen?.layoutData?.grid?.columns || 1;
  const configRows = screen?.layoutData?.grid?.rows || 1;
  const rootStyle = {
    gridTemplateAreas: createGrid(configColumns, configRows),
    gridTemplateColumns: `${'1fr'.repeat(configColumns)}`,
    gridTemplateRows: `${'1fr'.repeat(configRows)}%`,
  };

  return (
    <div className="Screen" style={rootStyle} id={screen['@id']}>
      {screen?.layoutData?.regions?.map((region) => (
        <Fragment key={region['@id']}>
          {/* Default region type */}
          {(!region.type || region.type === 'default') && (
            <Region key={region['@id']} region={region} />
          )}
          {/* Special region type: touch-buttons */}
          {region?.type === 'touch-buttons' && (
            <TouchRegion key={region['@id']} region={region} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

Screen.propTypes = {
  screen: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    layoutData: PropTypes.shape({
      grid: PropTypes.shape({
        columns: PropTypes.number.isRequired,
        rows: PropTypes.number.isRequired,
      }),
      regions: PropTypes.arrayOf(
        PropTypes.shape({
          '@id': PropTypes.string.isRequired,
          // @TODO: Expand prop type.
        })
      ),
    }).isRequired,
  }).isRequired,
};

export default Screen;
