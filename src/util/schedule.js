import { RRule } from 'rrule';

class ScheduleUtils {
  static occursNow(rruleString, durationSeconds) {
    const rrule = RRule.fromString(rruleString.replace('\\n', '\n'));
    const duration = durationSeconds * 1000;

    const now = new Date();

    // From the RRULE docs:_ "Returned "UTC" dates are always meant to be
    // interpreted as dates in your local timezone. This may mean you have to
    // do additional conversion to get the "correct" local time with offset
    // applied."
    //
    // We do the opposite to ensure that datetime comparisons works as expected.
    // For evaluation with the RRule library we pretend that "now" is in UTC instead of the local timezone.
    // That is 9:00 in Europe/Copenhagen time will be evaluated as if it was 9:00 in UTC.
    // @see https://github.com/jkbrzt/rrule#important-use-utc-dates
    const nowWithoutTimezone = new Date(
      Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      )
    );

    // Subtract duration from now to make sure all relevant occurrences are considered.
    const from = new Date(nowWithoutTimezone.getTime() - duration);

    let occurs = false;

    // RRule.prototype.between(after, before, inc=false [, iterator])
    // The between() function expects "after" and "before" to be in pretend UTC as
    // described above.
    rrule.between(
      from,
      nowWithoutTimezone,
      true,
      function iterator(occurrenceDate) {
        // The "ccurrenceDate" we are iterating over contains a "pretend UTC" datetime
        // object. As above, if the time for "occurrenceDate" is 09:00 UTC it should be
        // treated as 09:00 local time regardsless of the actual local timezone
        const end = new Date(occurrenceDate.getTime() + duration);

        if (nowWithoutTimezone >= occurrenceDate && nowWithoutTimezone <= end) {
          occurs = true;
          // break iteration.
          return false;
        }

        // continue iteration.
        return true;
      }
    );

    return occurs;
  }
}

export default ScheduleUtils;
