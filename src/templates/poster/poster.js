import { React, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './poster.scss';
import BaseSlideExecution from '../baseSlideExecution';
import dayjs from 'dayjs';
import localeDa from 'dayjs/locale/da';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { IntlProvider, FormattedMessage } from 'react-intl';

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
function Poster({ slide, content, run, slideDone }) {
  const [show, setShow] = useState(true);
  const [translations, setTranslations] = useState();

    /**
   * Imports language strings, sets localized formats
   * and sets timer.
   */
     useEffect(() => {
      dayjs.extend(localizedFormat);

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

    /**
   * Capitalize the datestring, as it starts with the weekday.
   *
   * @param {string} s
   *    The string to capitalize.
   * @returns {string}
   *    The capitalized string.
   */
     const capitalize = (s) => {
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

  return (
    <IntlProvider messages={translations} locale="da" defaultLocale="da">
      <div className="template-poster" >
        <div style={{backgroundImage: `url("${content.image}")` }} className={show ? "image-area fadeIn" : "image-area fadeOut"}>
      </div>
      {/* todo theme color */}
      <div className="header-area" style={{backgroundColor: "Azure"}}>
        <div className="header-area-center">
          <h1>{content.name}</h1>
          <p className="lead">{content.excerpt}</p>
        </div>
      </div>
      {/* todo theme color */}
      <div className="info-area" style={{backgroundColor: "Aquamarine"}}>
        {content.startDate && content.endDate &&
          <span>
            {/* todo if startdate is equal to enddate */}
            <span>
              <p className="info-area-date">{capitalize(dayjs(content.startDate).locale(localeDa).format('LLLL'))}</p>
            </span>
            {/* todo if startdate is not equal to enddate */}
            {false &&
              <span>
                <p className="info-area-date">{capitalize(dayjs(content.startDate).locale(localeDa).format('LLLL'))} - {capitalize(dayjs(content.endDate).locale(localeDa).format('LLLL'))}</p>
              </span>
            }
          </span>
        }
        {content.place &&
          <p className="info-area-place">{content.place.name}</p>
        }
            {!content.ticketPriceRange &&
          <p className="info-area-ticket"><FormattedMessage id="free" defaultMessage="free" /></p>
        }
        {content.ticketPriceRange &&
          <p className="info-area-ticket">{content.ticketPriceRange}</p>
        }
        {content.readMoreText && content.url && <p className="info-area-moreinfo">{content.readMoreText} <a href="#">{content.url}</a></p>}
        {content.readMoreText && <p className="info-area-moreinfo">{content.readMoreText}</p>}
      </div>

    </div>
    </IntlProvider>
  );
}


Poster.propTypes = {
  run: PropTypes.bool.isRequired,
  slideDone: PropTypes.func.isRequired,
  slide: PropTypes.shape({
    duration: PropTypes.number.isRequired
  }).isRequired,
  content: PropTypes.shape({
    endDate: PropTypes.string.isRequired,
    eventStatusText: PropTypes.any,
    excerpt: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    place: PropTypes.shape({
      addressLocality: PropTypes.string.isRequired,
      image: PropTypes.any,
      name: PropTypes.string.isRequired,
      postalCode: PropTypes.string.isRequired,
      streetAddress: PropTypes.string.isRequired,
      telephone: PropTypes.any
    }).isRequired,
    startDate: PropTypes.string.isRequired,
    ticketPriceRange: PropTypes.string.isRequired,
    ticketPurchaseUrl: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }).isRequired,
};

export default Poster;
