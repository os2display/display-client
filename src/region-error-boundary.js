import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from './logger/logger';
import './region-error-boundary.scss';

class RegionErrorBoundary extends Component {
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
  }

  render() {
    if (this.state.hasError) {
      return <div className="RegionErrorBoundary"><div className="ErrorBox">Error loading region</div></div>;
    }
    return <>{this.props.children}</>;
  }
}

RegionErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default RegionErrorBoundary;
