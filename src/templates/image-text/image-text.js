import { React, useEffect } from 'react';
import './image-text.scss';
import PropTypes from 'prop-types';

/**
 * ImageText component.
 * @param {object} props
 *   Props.
 * @param {object} props.slideExecution
 *   The slide.
 * @param {object} props.content
 *   The slide content.
 * @param {boolean} props.run
 *   Whether or not the slide should start running.
 * @returns {object}
 *   The component.
 */
function ImageText({ slideExecution, content, run }) {
  const rootStyle = {};
  const imageTextStyle = {};

  const { separator, boxAlign, reversed, boxMargin, halfSize, fontSize } =
    content.styling || {};
  const { title, text, textColor, boxColor, backgroundColor } = content;
  const displaySeparator = separator && !reversed;
  let rootClasses = 'template-image-text';
  const boxClasses = fontSize ? `box ${fontSize}` : 'box';
  /**
   * Setup slide run function.
   */
  useEffect(() => {
    if (run) {
      slideExecution.start();
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
    rootClasses = rootClasses.concat(' column');
  }

  if (boxAlign === 'bottom' || boxAlign === 'right') {
    rootClasses = rootClasses.concat(' flex-end');
  }
  if (reversed) {
    rootClasses = rootClasses.concat(' reversed');
  }
  if (boxMargin || reversed) {
    rootClasses = rootClasses.concat(' box-margin');
  }
  if (halfSize && !reversed) {
    rootClasses = rootClasses.concat(' half-size');
  }
  if (separator && !reversed) {
    rootClasses = rootClasses.concat(' animated-header');
  }

  return (
    <div className={rootClasses} style={rootStyle}>
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
          {text && <div className="text">{text}</div>}
        </div>
      )}
    </div>
  );
}

ImageText.propTypes = {
  run: PropTypes.bool.isRequired,
  slideExecution: PropTypes.shape({
    duration: PropTypes.number,
    slideDone: PropTypes.func,
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
