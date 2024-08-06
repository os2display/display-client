import { RRule } from 'rrule';

class ScheduleUtils {
  static occursNow(rruleString, durationSeconds) {
    const rrule = RRule.fromString(rruleString.replace("\\n", "\n"));
    const duration = durationSeconds * 1000;

    const now = new Date();
    // Subtract duration from now to make sure all relevant occurrences are considered.
    const from = new Date(now.getTime() - duration);

    let occurs = false;

    rrule.between(
      new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), from.getHours(), from.getMinutes(), from.getSeconds())),
      new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds())),
      true,
      function iterator(occurrenceDate) {
        const start = new Date(
          occurrenceDate.getUTCFullYear(),
          occurrenceDate.getUTCMonth(),
          occurrenceDate.getUTCDate(),
          occurrenceDate.getUTCHours(),
          occurrenceDate.getUTCMinutes(),
          occurrenceDate.getUTCSeconds(),
        );

        const end = new Date(start.getTime() + duration);

        if (now >= start && now <= end) {
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
