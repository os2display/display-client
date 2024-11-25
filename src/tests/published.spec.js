import dayjs from 'dayjs';
import ScheduleService from '../service/schedule-service';

let today = new Date();
let tomorrow = new Date(today);

tomorrow.setDate(tomorrow.getDate() + 1);

let yesterday = new Date(today);
yesterday.setDate(tomorrow.getDate() - 1);

today = dayjs(today).format('YYYY-MM-DDTHH:mm');

tomorrow = dayjs(tomorrow).format('YYYY-MM-DDTHH:mm');

yesterday = dayjs(yesterday).format('YYYY-MM-DDTHH:mm');

/**
 * A slide mock
 *
 * @param {string} from The slide from
 * @param {string} to The slide to
 * @returns {object} A slide mock
 */
function createSlideForTest(from, to) {
  return {
    published: {
      from,
      to,
    },
  };
}

/**
 * A playlist mock, with slidesdata
 *
 * @returns {object} A playlist mock
 */
function getPlaylistsWithTwoSlidesOnePublished() {
  return [
    {
      schedules: [],
      published: {
        from: `${today}`,
        to: `${tomorrow}`,
      },
      slidesData: [
        createSlideForTest(today, tomorrow),
        createSlideForTest(yesterday, yesterday),
      ],
    },
  ];
}

/**
 * A playlist mock, with a slide published with null values
 *
 * @returns {object} A playlist mock
 */
function getPlaylistsWithOneSlidePublishedWithNullValues() {
  return [
    {
      schedules: [],
      published: {
        from: `${today}`,
        to: `${tomorrow}`,
      },
      slidesData: [createSlideForTest(null, null)],
    },
  ];
}

/**
 * An unpublished playlist mock, with a published slide
 *
 * @returns {object} A playlist mock
 */
function getUnpublishedPlaylistWithOneSlidePublishedSlide() {
  return [
    {
      schedules: [],
      published: {
        from: `${yesterday}`,
        to: `${yesterday}`,
      },
      slidesData: [createSlideForTest(today, tomorrow)],
    },
  ];
}

/**
 *A playlist mock published with null values, with a published slide
 *
 * @returns {object} A playlist mock
 */
function getPlaylistPublishedWithNullValuesWithOneSlidePublishedSlide() {
  return [
    {
      schedules: [],
      published: {
        from: null,
        to: null,
      },
      slidesData: [createSlideForTest(today, tomorrow)],
    },
  ];
}

describe('Published playlist/slide tests', () => {
  it('Two slides where one is published should return one published slide', () => {
    const slides = ScheduleService.findScheduledSlides(
      getPlaylistsWithTwoSlidesOnePublished(),
      '123'
    );
    expect(1).to.eq(slides.length);
  });

  it('Slide with null values in from/to should return one published slide', () => {
    const slides = ScheduleService.findScheduledSlides(
      getPlaylistsWithOneSlidePublishedWithNullValues(),
      '123'
    );
    expect(1).to.eq(slides.length);
  });

  it('Unpublished playlist with published slides should return zero slides', () => {
    const slides = ScheduleService.findScheduledSlides(
      getUnpublishedPlaylistWithOneSlidePublishedSlide(),
      '123'
    );
    expect(0).to.eq(slides.length);
  });

  it('Playlist published with null and with one published slide should return zero slides', () => {
    const slides = ScheduleService.findScheduledSlides(
      getPlaylistPublishedWithNullValuesWithOneSlidePublishedSlide(),
      '123'
    );
    expect(1).to.eq(slides.length);
  });
});
