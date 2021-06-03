import { React } from 'react';
import PropTypes from 'prop-types';
import Playlist from './playlist';
import './region.scss';

function Region({ region }) {
  return (
    <div className="Region">
      {region?.playlists?.length > 0 &&
        region.playlists.map((playlist) => (
          <Playlist key={`${region.id}-${playlist.id}`} id={`${region.id}-${playlist.id}`} playlist={playlist} />
        ))}
    </div>
  );
}

Region.propTypes = {
  region: PropTypes.shape({
    id: PropTypes.string.isRequired,
    playlists: PropTypes.arrayOf(PropTypes.any).isRequired
  }).isRequired
};

export default Region;
