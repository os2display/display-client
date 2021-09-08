import { React, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseSlideExecution from '../baseSlideExecution';
import './contacts.scss';

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
 * @returns {object}
 *   The component.
 */
function Contacts({ slide, content, run, slideDone }) {


  const { contacts } = content;
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
      {contacts.map((contact) => (<>
        <div>{contact.title}</div>
        <div>{contact.name}</div>
        <div>{contact.email}</div>
        <div>{contact.phone}</div></>
      ))}
    </>
  );
}


Contacts.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired,
  }).isRequired,
  content: PropTypes.shape({

  }).isRequired,
};

export default Contacts;
