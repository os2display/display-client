import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, FormattedMessage } from 'react-intl';
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
  const [translations, setTranslations] = useState();
  const { separator } = content.styling || {};

  /**
   * Imports language strings, sets localized formats
   * and sets timer.
   */
  useEffect(() => {
    import('./lang/da.json').then((data) => {
      setTranslations(data);
    });
  }, []);

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
    <IntlProvider messages={translations} locale="da" defaultLocale="da">
      {/* todo add theme styling below */}
      <div className="contacts-template" style={{ backgroundColor: 'yellow' }}>
        <h1>
          <FormattedMessage id="contacts" defaultMessage="contacts" />
          {/* todo add theme styling below */}
          {separator && (
            <div className="separator" style={{ backgroundColor: '#ee0043' }} />
          )}
        </h1>
        <div className="contacts">
          {contacts.map((contact) => (
            <div className="contact">
              {contact.image && (
                <div
                  className="image-area"
                  style={{
                    backgroundImage: `url("${contact.image.url}")`,
                  }}
                />
              )}
              {!contact.image && <div className="image-area" />}
              <div className="text-container">
                <div>{contact.title}</div>
                <div>{contact.name}</div>
                <div>{contact.email}</div>
                <div>{contact.phone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </IntlProvider>
  );
}

Contacts.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired,
  }).isRequired,
  content: PropTypes.shape({
    contacts: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        image: PropTypes.shape({
          id: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired,
        }),
      })
    ),
    styling: PropTypes.shape({
      separator: PropTypes.bool,
    }),
  }).isRequired,
};

export default Contacts;
