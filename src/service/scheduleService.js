import cloneDeep from 'lodash.clonedeep';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import RRule from 'rrule';
import dayjs from 'dayjs';
import Logger from '../logger/logger';
import ConfigLoader from '../config-loader';

/**
 * ScheduleService.
 *
 * Supplies slides to the different regions.
 * Handles content scheduling.
 */
class ScheduleService {
  regions = {};

  intervals = {};

  constructor() {
    this.updateRegion = this.updateRegion.bind(this);
  }

  /**
   * Remove scheduling interval for region if region is removed.
   *
   * @param {string} regionId - The region id.
   */
  regionRemoved(regionId) {
    Logger.log('info', `removing scheduling interval for region: ${regionId}`);

    if (Object.prototype.hasOwnProperty.call(this.intervals, regionId)) {
      clearInterval(this.intervals[regionId]);
      delete this.intervals[regionId];
    }
  }

  /**
   * Handle region updates.
   *
   * @param {string} regionId - The region id.
   * @param {object} region - The region content, with playlists and slides, to start scheduling.
   */
  updateRegion(regionId, region) {
    Logger.log('info', `ScheduleService: updateRegion(${regionId})`);

    if (!region || !regionId) {
      Logger.log('info', `ScheduleService: regionId and/or region not set.`);
      return;
    }

    // Extract slides from playlists.
    const slides = ScheduleService.findScheduledSlides(region, regionId);

    // Calculate a hash of the region to test if it has changed.
    const hash = Base64.stringify(sha256(JSON.stringify({ region, slides })));
    const newContent = hash !== this?.regions[regionId]?.hash;

    // Update region.
    this.regions[regionId] = {
      hash,
      slides,
      region,
    };

    if (!Object.prototype.hasOwnProperty.call(this.intervals, regionId)) {
      ConfigLoader.loadConfig().then((config) => {
        const schedulingInterval = config?.schedulingInterval ?? 60000;

        Logger.log(
          'info',
          `registering scheduling interval for region: ${regionId}, with an update rate of ${schedulingInterval}`
        );

        this.intervals[regionId] = setInterval(
          () => this.checkScheduling(regionId),
          schedulingInterval
        );
      });
    }

    if (newContent) {
      // Send slides to region.
      ScheduleService.sendSlides(regionId, slides);
    }
  }

  /**
   * Check scheduling for playlists and slides, to see if there are changes compared with current shown content.
   *
   * @param {string} regionId - The region to check.
   */
  checkScheduling(regionId) {
    Logger.log('info', `checkScheduling for region: ${regionId}`);

    const region = this.regions[regionId];

    // Extract slides from playlists.
    const slides = ScheduleService.findScheduledSlides(region.region, regionId);

    // Calculate a hash of the region to test if it has changed.
    const hash = Base64.stringify(
      sha256(JSON.stringify({ region: region.region, slides }))
    );
    const newContent = hash !== this?.regions[regionId]?.hash;

    // Update region.
    this.regions[regionId].hash = hash;
    this.regions[regionId].slides = slides;

    if (newContent) {
      // Send slides to region.
      ScheduleService.sendSlides(regionId, slides);
    }
  }

  /**
   * Send next slides.
   *
   * @param {string} regionId
   *   The region id to send slides to.
   * @param {Array} slides
   *   Array of slides.
   */
  static sendSlides(regionId, slides) {
    Logger.log('info', `sendSlides regionContent-${regionId}`);
    const event = new CustomEvent(`regionContent-${regionId}`, {
      detail: {
        slides,
      },
    });
    document.dispatchEvent(event);
  }

  /**
   * Check published state.
   *
   * @param {object} publishedState - The published state.
   * @returns {boolean} - Published true/false.
   */
  static isPublished(publishedState) {
    const now = dayjs(new Date());
    const from = publishedState?.from ? dayjs(publishedState.from) : null;
    const to = publishedState?.to ? dayjs(publishedState.to) : null;

    if (from !== null && to !== null) {
      return now.isAfter(from) && now.isBefore(to);
    }
    if (from !== null && to === null) {
      return now.isAfter(from);
    }
    if (from === null && to !== null) {
      return now.isBefore(to);
    }
    return true;
  }

  /**
   * Find slides that are scheduled and published now in the given region.
   *
   * @param {Array} playlists - The playlists to look through, with the slidesData attached.
   * @param {string} regionId - The region id. Used to creating a unique executionId for each slide.
   * @returns {Array} - Array of slides.
   */
  static findScheduledSlides(playlists, regionId) {
    const slides = [];

    const now = new Date();
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    playlists.forEach((playlist) => {
      const { schedules } = playlist;

      if (!this.isPublished(playlist?.published)) {
        return;
      }

      let occurs = true;

      // If schedules are set for the playlist, do not show playlist unless a schedule is active.
      if (schedules.length > 0) {
        occurs = false;

        schedules.forEach((schedule) => {
          const rrule = RRule.fromString(schedule.rrule.replace('\\n', '\n'));
          rrule.between(
            // Subtract duration from now to make sure all relevant occurrences are considered.
            new Date(
              now.getTime() - (schedule.duration ? schedule.duration * 1000 : 0)
            ),
            now,
            true,
            function iterator(occurrenceDate) {
              const occurrenceEnd = new Date(
                occurrenceDate.getTime() + schedule.duration * 1000
              );

              if (now >= occurrenceDate && now <= occurrenceEnd) {
                occurs = true;
                // Break the iteration.
                return false;
              }
              return true;
            }
          );
        });
      }

      if (occurs) {
        playlist?.slidesData?.forEach((slide) => {
          if (!this.isPublished(slide.published)) {
            return;
          }

          const newSlide = cloneDeep(slide);
          // Execution id is the product of region, playlist and slide id, to ensure uniqueness in the client.
          newSlide.executionId = Base64.stringify(
            sha256(regionId + playlist['@id'] + slide['@id'])
          );
          slides.push(newSlide);
        });
      }
    });

    return slides;
  }
}

export default ScheduleService;
