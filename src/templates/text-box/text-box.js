import { React } from 'react';
import './text-box.scss';
import PropTypes from 'prop-types';

function TextBox({ content }) {
  const rootStyle = {};
  const textBoxStyle = {};

  // Set background image.
  if (content?.media) {
    rootStyle['background-image'] = `url("${content.media[0].url}")`;
  }

  if (content.boxAlign === 'left' || content.boxAlign === 'right') {
    rootStyle['flex-direction'] = 'column';
  }

  if (content?.boxAlign === 'bottom' || content.boxAlign === 'right') {
    textBoxStyle['align-self'] = 'flex-end';
  }

  return (
    <div className="template-text-box" style={rootStyle}>
      <div className="box" style={textBoxStyle}>
        <h1>{content.title}</h1>
        <div>{content.text}</div>
      </div>
    </div>
  );
}

TextBox.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string,
    text: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    media: PropTypes.array,
    // Accepted values: top, bottom, left, right.
    boxAlign: PropTypes.string
  }).isRequired
};

export default TextBox;
