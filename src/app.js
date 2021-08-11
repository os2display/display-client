import { React, useEffect, useState } from 'react';
import Screen from './screen';
import './app.scss';

/**
 * App component.
 *
 * @returns {object}
 *   The component.
 */
function App() {
  const [screen, setScreen] = useState('');

  /**
   * Handles "screen" events.
   *
   * @param {CustomEvent} event
   *   The event.
   */
  function screenHandler(event) {
    const screenData = event.detail?.screen;

    if (screenData !== null) {
      setScreen(screenData);
    }
  }

  useEffect(() => {
    document.addEventListener('screen', screenHandler);

    return function cleanup() {
      document.removeEventListener('screen', screenHandler);
    };
  }, []);

  return <div className="App">{screen && <Screen screen={screen} />}</div>;
}

export default App;
