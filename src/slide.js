import { React } from 'react';
import PropTypes from 'prop-types';
import TextBox from './templates/text-box/text-box';
import './slide.scss';

/**
 * Slide component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.slide
 *   The slide data.
 * @returns {JSX.Element}
 *   The component.
 */
function Slide({ slide }) {
  let slideComponent;

  if (slide.template === 'template-text-box') {
    slideComponent = <TextBox content={slide.content} />;
  } else {
    slideComponent = <>Unknown template</>;
  }

  // @TODO: Load template.
  return <div className="Slide">{slideComponent}</div>;
}

Slide.propTypes = {
  slide: PropTypes.shape({
    template: PropTypes.string.isRequired,
    content: PropTypes.objectOf(PropTypes.any).isRequired
  }).isRequired
};

export default Slide;
