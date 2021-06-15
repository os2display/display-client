import { React } from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import './book-review.scss';
import DOMPurify from 'dompurify';

/**
 * Book review component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.content
 *   The slide content.
 * @returns {JSX.Element}
 *   The component.
 */
function BookReview({ content }) {
  const { authorText, bookText } = content;
  const authorUrl = content.media?.authorImage?.url;
  const bookUrl = content.media?.bookImage?.url;
  const authorImage = authorUrl ? { backgroundImage: `url("${authorUrl}")` } : '';
  const bookImage = bookUrl ? { backgroundImage: `url("${bookUrl}")` } : '';
  const sanitizedBookText = DOMPurify.sanitize(bookText);

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
