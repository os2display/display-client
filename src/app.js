import { React } from 'react';
import TestComponent from './test-component';
import ErrorBoundary from './error-boundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <div>Display client</div>
        <TestComponent />
      </div>
    </ErrorBoundary>
  );
}

export default App;
