import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from './logger/logger';
import './error-boundary.scss';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Update state so the next render will show the fallback UI.
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Logger.log('error', `ErrorBoundary caught error: ${error}`, errorInfo);

    const { errorHandler } = this.props;
    errorHandler(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div className="ErrorBoundary">
          <div className="ErrorBoundaryLoader">Loading...</div>
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
