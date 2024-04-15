/**
 * @param {object} string - The url to cut id from.
 * @returns {string|boolean} The id or false.
 */
function idFromPath(string) {
  if (typeof string === 'string') {
    const matches = string.match(/[A-Za-z0-9]{26}/);
    if (matches instanceof Array) {
      return matches.shift();
    }
  }
  return false;
}

export default idFromPath;
