import dayjs from 'dayjs';

/**
 * Check published state.
 *
 * @param {object} publishedState - The published state.
 * @returns {boolean} - Published true/false.
 */
function isPublished(publishedState) {
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

export default isPublished;
