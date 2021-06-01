import { React } from 'react';
import './text-box.scss';
import PropTypes from 'prop-types';

function TextBox({ content }) {
  const rootStyle = {};
  const textBoxStyle = {};

  // Set background image.
  if (content?.media?.length > 0) {
    rootStyle.backgroundImage = `url("${content.media[0].url}")`;
  }

  // Position text-box.
  if (content.boxAlign === 'left' || content.boxAlign === 'right') {
    rootStyle.flexDirection = 'column';
  }
  if (content?.boxAlign === 'bottom' || content.boxAlign === 'right') {
    textBoxStyle.alignSelf = 'flex-end';
  }

  return (
    <div className="template-text-box" style={rootStyle}>
      {content.title && content.text && (
        <div className="box" style={textBoxStyle}>
          {content.title && <h1 className="headline">{content.title}</h1>}
          {content.text && <div className="text">{content.text}</div>}
        </div>
      )}
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
