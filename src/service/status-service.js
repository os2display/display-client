import constants from '../util/constants';

class StatusService {
  status = constants.STATUS_INIT;

  error = null;

  setStatus = (newStatus) => {
    this.status = newStatus;
    this.setStatusInUrl();
  };

  setError = (newError) => {
    this.error = newError;
    this.setStatusInUrl();
  };

  setStatusInUrl = () => {
    const url = new URL(window.location.href);

    if (this.status) {
      url.searchParams.set('status', this.status);
    } else {
      url.searchParams.delete('status');
    }

    if (this.error) {
      url.searchParams.set('error', this.error);
    } else {
      url.searchParams.delete('error');
    }

    window.history.replaceState(null, '', url);
  };
}

// Singleton.
const statusService = new StatusService();

export default statusService;
