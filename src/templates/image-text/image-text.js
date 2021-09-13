import { React, useEffect } from 'react';
import './image-text.scss';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import BaseSlideExecution from '../baseSlideExecution';

/**
 * ImageText component.
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
 * @returns {object}
 *   The component.
 */
function ImageText({ slide, content, run, slideDone }) {
  // Styling from content
  const {
    separator,
    boxAlign,
    reversed,
    boxMargin,
    halfSize,
    fontSize,
    shadow,
  } = content.styling || {};
  const boxClasses = fontSize ? `box ${fontSize}` : 'box';
  const rootClasses = ['template-image-text'];

  // Styling objects
  const rootStyle = {};
  const imageTextStyle = {};

  // Content from content
  const { title, text, textColor, boxColor, backgroundColor } = content;
  const sanitizedText = DOMPurify.sanitize(text);

  // Duration
  const { duration } = slide;

  // Display separator depends on whether the slide is reversed.
  const displaySeparator = separator && !reversed;

  /**
   * Setup slide run function.
   */
  const slideExecution = new BaseSlideExecution(slide, slideDone);
  useEffect(() => {
    if (run) {
      slideExecution.start(duration);
    } else {
      slideExecution.stop();
    }

    return function cleanup() {
      slideExecution.stop();
    };
  }, [run]);

  // Set background image and background color.
  if (content.media?.url) {
    rootStyle.backgroundImage = `url("${content.media?.url}")`;
  }
  if (backgroundColor) {
    rootStyle.backgroundColor = backgroundColor;
  }

  // Set box colors.
  if (boxColor) {
    imageTextStyle.backgroundColor = boxColor;
  }
  if (textColor) {
    imageTextStyle.color = textColor;
  }

  // Position text-box.
  if (boxAlign === 'left' || boxAlign === 'right') {
    rootClasses.push('column');
  }

  if (boxAlign === 'bottom' || boxAlign === 'right') {
    rootClasses.push('flex-end');
  }
  if (reversed) {
    rootClasses.push('reversed');
  }
  if (boxMargin || reversed) {
    rootClasses.push('box-margin');
  }
  if (halfSize && !reversed) {
    rootClasses.push('half-size');
  }
  if (separator && !reversed) {
    rootClasses.push('animated-header');
  }

  if (shadow) {
    rootClasses.push('shadow');
  }

  return (
    <div className={rootClasses} style={rootStyle.join(' ')}>
      {title && (
        <div className={boxClasses} style={imageTextStyle}>
          {title && (
            <h1>
              {title}
              {/* Todo theme the color of the below */}
              {displaySeparator && (
                <div
                  className="separator"
                  style={{ backgroundColor: '#ee0043' }}
                />
              )}
            </h1>
          )}
          {text && <div className="text">{parse(sanitizedText)}</div>}
        </div>
      )}
    </div>
  );
}

ImageText.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    instanceId: PropTypes.string,
    duration: PropTypes.number.isRequired,
  }).isRequired,
  content: PropTypes.shape({
    title: PropTypes.string,
    text: PropTypes.string,
    media: PropTypes.shape({ url: PropTypes.string }),
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    boxColor: PropTypes.string,
    styling: PropTypes.shape({
      // Accepted values: top, bottom, left, right.
      boxAlign: PropTypes.string,
      boxMargin: PropTypes.bool,
      separator: PropTypes.bool,
      reversed: PropTypes.bool,
      halfSize: PropTypes.bool,
      fontSize: PropTypes.string,
    }),
  }).isRequired,
};

export default ImageText;
