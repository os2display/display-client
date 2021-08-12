import { React, useEffect } from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import './book-review.scss';
import DOMPurify from 'dompurify';

/**
 * Book review component.
 *
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
function BookReview({ slideExecution, content, run }) {
  const { authorText, bookText } = content;
  const authorUrl = content.media?.authorImage?.url;
  const bookUrl = content.media?.bookImage?.url;
  const authorImage = authorUrl
    ? { backgroundImage: `url("${authorUrl}")` }
    : '';
  const bookImage = bookUrl ? { backgroundImage: `url("${bookUrl}")` } : '';
  const sanitizedBookText = DOMPurify.sanitize(bookText);

  /**
   * Setup slide run function.
   */
  useEffect(() => {
    if (run) {
      slideExecution.start();
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
  url: PropTypes.string.isRequired,
});

BookReview.propTypes = {
  run: PropTypes.bool.isRequired,
  slideExecution: PropTypes.shape({
    duration: PropTypes.number,
    slideDone: PropTypes.func,
    start: PropTypes.func,
    stop: PropTypes.func,
  }).isRequired,
  content: PropTypes.shape({
    authorText: PropTypes.string,
    media: PropTypes.shape({
      authorImage: imageShape,
      bookImage: imageShape,
    }).isRequired,
    bookText: PropTypes.string,
  }).isRequired,
};

export default BookReview;
