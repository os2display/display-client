import logger from "../logger/logger.js";
import ReleaseLoader from "../util/release-loader.js";
import ConfigLoader from "../util/config-loader.js";
import defaults from "../util/defaults.js";
import idFromPath from "../util/id-from-path.js";

class ReleaseService {
  currentReleaseTimestamp = null;
  releaseCheckInterval = null;

  checkForUpdates = () => {
    logger.info("Checking for new release timestamp.");

    ReleaseLoader.loadConfig().then((release) => {
      if (this.currentReleaseTimestamp === null) {
        this.currentReleaseTimestamp = release.releaseTimestamp;
      } else if (this.currentReleaseTimestamp !== release.releaseTimestamp) {
        if (
          release.releaseTimestamp !== null &&
          release.releaseVersion !== null
        ) {
          const redirectUrl = new URL(window.location.href);
          redirectUrl.searchParams.set(
            "releaseTimestamp",
            release.releaseTimestamp
          );
          redirectUrl.searchParams.set(
            "releaseVersion",
            release.releaseVersion
          );

          window.location.replace(redirectUrl);
        } else {
          logger.info("Release timestamp or version null, not redirecting.");
        }
      }
    });
  };

  setCurrentReleaseInUrl = () => {
    const currentUrl = new URL(window.location.href);

    // Make sure have releaseVersion and releaseTimestamp set in url parameters.
    if (
      !currentUrl.searchParams.has("releaseVersion") ||
      !currentUrl.searchParams.has("releaseTimestamp")
    ) {
      ReleaseLoader.loadConfig().then((release) => {
        if (
          release.releaseTimestamp !== null &&
          release.releaseVersion !== null
        ) {
          currentUrl.searchParams.set(
            "releaseTimestamp",
            release.releaseTimestamp
          );
          currentUrl.searchParams.set("releaseVersion", release.releaseVersion);

          window.history.replaceState(null, "", currentUrl);
        } else {
          logger.info(
            "Release timestamp or version null, not setting query parameters."
          );
        }
      });
    }
  }

  setScreenIdInUrl = (screenId) => {
    // Append screenId to current url for easier debugging. If errors are logged in the API's standard http log this
    // makes it easy to see what screen client has made the http call by putting the screen id in the referer http
    // header.
    const url = new URL(window.location.href);
    url.searchParams.set("screenId", idFromPath(screenId));
    window.history.replaceState(null, "", url);
  }

  startReleaseCheck = () => {
    ConfigLoader.loadConfig().then((config) => {
      this.releaseCheckInterval = setInterval(
        releaseService.checkForUpdates,
        config.releaseTimestampIntervalTimeout ??
        defaults.releaseTimestampIntervalTimeoutDefault
      );
    });
  }

  stopReleaseCheck = () => {
    if (this.releaseCheckInterval) {
      clearInterval(this.releaseCheckInterval);
    }
  }
}

// Singleton.
const releaseService = new ReleaseService();

export default releaseService;
