import { React } from 'react';
import PropTypes from 'prop-types';
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
  // TODO, find a more elegant solution for grid layout.
  const alphabet = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'x',
    'y',
    'z',
    'aa',
    'bb',
    'cc',
    'dd',
    'ee',
    'ff',
    'gg',
    'hh',
    'ii',
    'jj',
    'kk',
    'll',
    'mm',
    'nn',
    'oo',
    'pp',
    'qq',
    'rr',
    'ss',
    'tt',
    'uu',
    'vv',
    'xx',
    'yy',
    'zz'
  ];

  const configColumns = screen.grid?.columns || 1;
  const configRows = screen.grid?.rows || 1;
  const rootStyle = {};

  /**
   * @param {number} columns
   *   Number of columns.
   * @param {number} rows
   *   Number of rows.
   * @returns {string}
   *   String of grid entries.
   */
  function createGrid(columns, rows) {
    const arrayOfGridTemplateAreas = new Array(columns);
    // Create two dimensional array.
    for (let i = 0; i < arrayOfGridTemplateAreas.length; i += 1) {
      arrayOfGridTemplateAreas[i] = new Array(rows);
    }

    let h = 0;

    // Add alphabetical chartacters to array.
    for (let i = 0; i < columns; i += 1) {
      for (let j = 0; j < rows; j += 1) {
        arrayOfGridTemplateAreas[i][j] = alphabet[h];
        h += 1;
      }
    }

    let gridTemplateAreas = '';
    // Create the grid-template-areas string.
    arrayOfGridTemplateAreas.forEach((element) => {
      gridTemplateAreas += `'${element.join(' ')}'\n `;
    });

    return gridTemplateAreas;
  }
  rootStyle.gridTemplateAreas = createGrid(configColumns, configRows);
  return (
    <div className="Screen" style={rootStyle}>
      {screen?.regions?.length > 0 && screen.regions.map((region) => <Region key={region.id} region={region} />)}
    </div>
  );
}

Screen.propTypes = {
  screen: PropTypes.shape({
    regions: PropTypes.arrayOf(PropTypes.any).isRequired,
    grid: PropTypes.shape({
      columns: PropTypes.number.isRequired,
      rows: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
};

export default Screen;
