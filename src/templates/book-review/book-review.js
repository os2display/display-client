import { React, useEffect } from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import './book-review.scss';
import DOMPurify from 'dompurify';
import BaseSlideExecution from '../baseSlideExecution';

/**
 * Book review component.
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
function BookReview({ slide, content, run, slideDone }) {
  const { authorText, bookText } = content;
  const authorUrl = content.media?.authorImage?.url;
  const bookUrl = content.media?.bookImage?.url;
  const authorImage = authorUrl ? { backgroundImage: `url("${authorUrl}")` } : '';
  const bookImage = bookUrl ? { backgroundImage: `url("${bookUrl}")` } : '';
  const sanitizedBookText = DOMPurify.sanitize(bookText);

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
  }, [run]);

  return (
    <>
      <div className="template-book-review">
        <div className="text-area">
          <p>{parse(sanitizedBookText)}</p>
        </div>
        <div className="author-area">
          {authorImage && <div className="author-image" style={authorImage} />}
          <div className="author">{authorText}</div>
        </div>
        <div className="book-image-area">
          {bookImage && (
            <>
              <div className="image-blurry-background" style={bookImage} />
              <div className="book-image">
                <img src={bookUrl} alt="book" />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const imageShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired
});

BookReview.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({
    authorText: PropTypes.string,
    media: PropTypes.shape({
      authorImage: imageShape,
      bookImage: imageShape
    }).isRequired,
    bookText: PropTypes.string
  }).isRequired
};

export default BookReview;
