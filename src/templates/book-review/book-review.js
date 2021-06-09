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
  const authorImage = {};
  authorImage.backgroundImage = `url("${authorUrl}")`;
  const bookImage = {};
  bookImage.backgroundImage = `url("${bookUrl}")`;

  return (
    <>
      <div className="dokk1-book-review">
        <div className="text-area"><p>{parse(bookText)}</p></div>
        <div className="author-area"><div class="author-image" style={authorImage}></div><div class="author">{authorText}</div></div>
        <div className="book-image-area">
          <div class="image-blurry-background" style={bookImage}></div>
          <div class="book-image"><img src={bookUrl}></img> </div>


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
      author: imageShape.isRequired,
      bookImage: imageShape.isRequired
    }).isRequired,
    text: PropTypes.string.isRequired
  }).isRequired
};

export default BookReview;
