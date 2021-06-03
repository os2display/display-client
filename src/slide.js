import { React } from 'react';
import PropTypes from 'prop-types';
import TextBox from './templates/text-box/text-box';
import './slide.scss';

function Slide({ slide }) {
  // @TODO: Load template.
  return <div className="Slide">{slide?.content && <TextBox content={slide.content} />}</div>;
}

Slide.propTypes = {
  slide: PropTypes.shape({
    content: PropTypes.objectOf(PropTypes.any).isRequired
  }).isRequired
};

export default Slide;
