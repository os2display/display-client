import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from './logger/logger';
import './error-boundary.scss';
import fallback from './assets/fallback.png';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null, errorStackTrace: null };
  }

  // Update state so the next render will show the fallback UI.
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Logger.log('error', `ErrorBoundary caught error: ${error}`, errorInfo);

    const { errorHandler } = this.props;
    errorHandler(error, errorInfo);

    this.setState({
      errorMessage: error.message.toString(),
      errorStackTrace: errorInfo.componentStack,
    });
  }

  render() {
    const { hasError, errorMessage, errorStackTrace } = this.state;

    if (hasError) {
      return (
        <div
          className="error-boundary"
          style={{ backgroundImage: `url(${fallback})` }}
        >
          <div className="error-boundary-box">
            <div>{errorMessage}</div>
            <pre className="error-boundary-stacktrace">{errorStackTrace}</pre>
          </div>
        </div>
      );
    }

    const { children } = this.props;
    return <>{children}</>;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  errorHandler: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  errorHandler: () => {},
};

export default ErrorBoundary;
