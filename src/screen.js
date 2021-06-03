import { React } from 'react';
import PropTypes from 'prop-types';
import Region from './region';
import './screen.scss';

function Screen({ screen }) {
  return (
    <div className="Screen">
      {screen?.regions?.length > 0 && screen.regions.map((region) => <Region key={region.id} region={region} />)}
    </div>
  );
}

Screen.propTypes = {
  screen: PropTypes.shape({
    regions: PropTypes.arrayOf(PropTypes.any).isRequired
  }).isRequired
};

export default Screen;
