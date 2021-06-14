import { React } from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';
import './book-review.scss';
/**
 * Slideshow component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.content
 *   The slide content.
 * @returns {JSX.Element}
 *   The component.
 */
function BookReview({ content }) {
  const {
    authorText,
    media: {
      authorImage: { url: authorUrl },
      bookImage: { url: bookUrl }
    },
    bookText
  } = content;
  const authorImage = { backgroundImage: `url("${authorUrl}")` };
  const bookImage = { backgroundImage: `url("${bookUrl}")` };

  return (
    <>
      <div className="dokk1-book-review">
        <div className="text-area">
          <p>{parse(bookText)}</p>
        </div>
        <div className="author-area">
          <div className="author-image" style={authorImage} />
          <div className="author">{authorText}</div>
        </div>
        <div className="book-image-area">
          <div className="image-blurry-background" style={bookImage} />
          <div className="book-image">
            <img src={bookUrl} alt="book" />
          </div>
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
    authorText: PropTypes.string.isRequired,
    media: PropTypes.shape({
      authorImage: imageShape.isRequired,
      bookImage: imageShape.isRequired
    }).isRequired,
    bookText: PropTypes.string.isRequired
  }).isRequired
};

export default BookReview;
