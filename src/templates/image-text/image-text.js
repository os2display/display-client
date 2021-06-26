import { React, useEffect } from 'react';
import './image-text.scss';
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
 * @returns {JSX.Element}
 *   The component.
 */
function ImageText({ slide, content, run, slideDone }) {
  const rootStyle = {};
  const imageTextStyle = {};
  let rootClasses = 'template-image-text';

  /**
   * Setup slide run function.
   */
  const slideExecution = new BaseSlideExecution(slide, slideDone);
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
  if (content.media?.length > 0) {
    rootStyle.backgroundImage = `url("${content.media[0].url}")`;
  }
  if (content.backgroundColor) {
    rootStyle.backgroundColor = content.backgroundColor;
  }

  // Set box colors.
  if (content.boxColor) {
    imageTextStyle.backgroundColor = content.boxColor;
  }
  if (content.textColor) {
    imageTextStyle.color = content.textColor;
  }

  // Position text-box.
  if (content.styling?.boxAlign === 'left' || content.styling?.boxAlign === 'right') {
    rootStyle.flexDirection = 'column';
  }

  if (content.styling?.boxAlign === 'bottom' || content.styling?.boxAlign === 'right') {
    imageTextStyle.alignSelf = 'flex-end';
  }


  if (content.styling?.boxMargin) {
    imageTextStyle.margin = '5%';
  }
  if (content.styling?.halfSize) {
    rootClasses = rootClasses.concat(' half-size');

  }
  if (content.styling?.separator) {
    rootClasses = rootClasses.concat(' animated-header');
  }

  return (
    <div className={rootClasses} style={rootStyle}>
      {content.title && content.text && (
        <div className="box" style={imageTextStyle}>
          {content.title && (
            <h1>
              {content.title}
              {/* Todo theme the color of the below */}
              {content.styling?.separator && <div className="separator" style={{ backgroundColor: '#ee0043' }} />}
            </h1>
          )}
          {content.text && <div className="text">{content.text}</div>}
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
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({
    title: PropTypes.string,
    text: PropTypes.string,
    media: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string })),
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    boxColor: PropTypes.string,
    styling: PropTypes.shape({
      // Accepted values: top, bottom, left, right.
      boxAlign: PropTypes.string,
      boxMargin: PropTypes.bool,
      separator: PropTypes.bool
    })
  }).isRequired
};

export default ImageText;
