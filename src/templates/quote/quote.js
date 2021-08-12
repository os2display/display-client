import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './quote.scss';
import { ReactComponent as Logo } from './citation-mark.svg';

/**
 * Quote component.
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
function Quote({ slideExecution, content, run }) {
  const { quotes, quoteInTwoLines } = content;
  const quoteClasses = quoteInTwoLines ? 'quote two-lines' : 'quote';
  const [first] = quotes;
  const [currentQuote, setCurrentQuote] = useState(first);
  const [show, setShow] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentIndex = quotes.indexOf(currentQuote);
      const nextIndex = (currentIndex + 1) % quotes.length;
      setCurrentQuote(quotes[nextIndex]);
      setShow(true);
    }, currentQuote.duration);

    const animationTimer = setTimeout(() => {
      setShow(false);
    }, currentQuote.duration - 1500);

    return function cleanup() {
      if (timer !== null) {
        clearInterval(timer);
      }
      if (animationTimer !== null) {
        clearInterval(animationTimer);
      }
    };
  }, [currentQuote]);

  return (
    <>
      <div className={show ? 'template-quote show' : 'template-quote hide'}>
        {/* todo make this themeable */}
        <Logo style={{ stroke: 'red' }} />
        <div className="quote-container">
          <div className={quoteClasses}>{currentQuote.quote}</div>
          <div className="author">{currentQuote.author}</div>
        </div>
      </div>
    </>
  );
}

Quote.propTypes = {
  run: PropTypes.bool.isRequired,
  slideExecution: PropTypes.shape({
    duration: PropTypes.number,
    slideDone: PropTypes.func,
  }).isRequired,
  content: PropTypes.shape({
    quotes: PropTypes.arrayOf(
      PropTypes.shape({ quote: PropTypes.string, author: PropTypes.string })
    ),
    quoteInTwoLines: PropTypes.bool,
  }).isRequired,
};

export default Quote;
