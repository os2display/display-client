import { React } from 'react';
import PropTypes from 'prop-types';
import Slide from './slide';
import './playlist.scss';

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
