import { React, useEffect } from 'react';
import './text-box.scss';
import PropTypes from 'prop-types';
import BaseSlideExecution from '../baseSlideExecution';

/**
 * TextBox component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.slide
 *   The slide.
 * @param {object} props.content
 *   The slide content.
 * @param {boolean} props.run
 *   Whether or not the slide should start running.
 * @param {Function} props.slideDone
 *   Function to invoke when the slide is done playing.
 * @returns {JSX.Element}
 *   The component.
 */
function TextBox({ slide, content, run, slideDone }) {
  const rootStyle = {};
  const textBoxStyle = {};
  const slideExecution = new BaseSlideExecution(slide, slideDone);

  /**
   * Setup slide run function.
   */
  useEffect(() => {
    if (run) {
      slideExecution.start(slide.duration);
    } else {
      slideExecution.stop();
    }

    return function cleanup() {
      slideExecution.stop();
    };
  }, [run]);

  // Set background image and background color.
  if (content?.media?.length > 0) {
    rootStyle.backgroundImage = `url("${content.media[0].url}")`;
  }
  if (content?.backgroundColor) {
    rootStyle.backgroundColor = content.backgroundColor;
  }

  // Set box colors.
  if (content?.boxColor) {
    textBoxStyle.backgroundColor = content.boxColor;
  }
  if (content?.textColor) {
    textBoxStyle.color = content.textColor;
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
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    instanceId: PropTypes.string,
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({
    title: PropTypes.string,
    text: PropTypes.string,
    media: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string })),
    // Accepted values: top, bottom, left, right.
    boxAlign: PropTypes.string,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    boxColor: PropTypes.string
  }).isRequired
};

export default TextBox;
