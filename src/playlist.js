import { React } from 'react';
import PropTypes from 'prop-types';
import Slide from './slide';
import './playlist.scss';

/**
 * Playlist component.
 *
 * @param {object} root0
 *   The parameters.
 * @param {Array} root0.playlist
 *   The playlist.
 * @param {string} root0.id
 *   The playlist id.
 * @returns {JSX.Element}
 *   The component.
 */
function Playlist({ playlist, id }) {
  return (
    <div className="Playlist">
      {playlist?.slides?.length > 0 &&
        playlist.slides.map((slide) => <Slide key={`${id}-${slide.id}`} id={`${id}-${slide.id}`} slide={slide} />)}
    </div>
  );
}

Playlist.propTypes = {
  id: PropTypes.string.isRequired,
  playlist: PropTypes.shape({
    slides: PropTypes.arrayOf(PropTypes.any).isRequired
  }).isRequired
};

export default Playlist;
