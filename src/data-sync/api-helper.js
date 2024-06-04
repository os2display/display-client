// import Logger from '../logger/logger';
import localStorageKeys from '../local-storage-keys';

class ApiHelper {
  endpoint = '';

  /**
   * Constructor.
   *
   * @param {string} endpoint The API endpoint.
   */
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Get result from path.
   *
   * @param {string} path Path to the resource.
   * @returns {Promise<any>} Promise with data.
   */
  async getPath(path) {
    if (!path) {
      throw new Error('No path');
    }

    let response;

    try {
      // logger.log('info', `Fetching: ${this.endpoint + path}`);

      const token = localStorage.getItem(localStorageKeys.API_TOKEN) ?? '';
      const tenantKey = localStorage.getItem(localStorageKeys.TENANT_KEY) ?? '';

      response = await fetch(this.endpoint + path, {
        headers: {
          authorization: `Bearer ${token}`,
          'Authorization-Tenant-Key': tenantKey,
        },
      });

      if (response.ok === false) {
        // TODO: Change to a better strategy for triggering reauthenticate.
        if (response.status === 401) {
          document.dispatchEvent(new Event('stopDataSync'));
          document.dispatchEvent(new Event('reauthenticate'));
        }

        // logger.log(
        // 'error',
        // `Failed to fetch (status: ${response.status}): ${
        //   this.endpoint + path
        // }`
        // );

        return null;
      }

      return response.json();
    } catch (err) {
      // logger.log('error', `Failed to fetch: ${this.endpoint + path}`);

      return null;
    }
  }

  /**
   * Gets all resources from the given path.
   *
   * @param {string} path Path to the resources.
   * @param {object} keys Keys that should be passed along with the result.
   * @returns {Promise<*>} Promise with all resources from a path.
   */
  async getAllResultsFromPath(path, keys = {}) {
    let results = [];
    let nextPath = `${path}`;
    let continueLoop = false;
    let page = 1;

    do {
      try {
        // eslint-disable-next-line no-await-in-loop
        const responseData = await this.getPath(nextPath);
        results = results.concat(responseData['hydra:member']);
        if (results.length < responseData['hydra:totalItems']) {
          page += 1;
          continueLoop = true;
          nextPath = `${path}?page=${page}`;
        } else {
          continueLoop = false;
        }
      } catch (err) {
        return {};
      }
    } while (continueLoop);

    return { path, results, keys };
  }
}

export default ApiHelper;
