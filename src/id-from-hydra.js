/**
 * @param {object} string - The url to cut id from.
 * @returns {boolean} The id or false.
 */
function idFromHydra(string) {
  if (typeof string === 'string') {
    const matches = string.match(/[A-Za-z0-9]{26}/);
    if (matches instanceof Array) {
      return matches.shift();
    }
  }
  return false;
}

export default idFromHydra;
