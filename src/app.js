import { React, useEffect, useState } from 'react';
import Screen from './screen';
import './app.scss';

/**
 * App component.
 *
 * @returns {JSX.Element}
 *   The component.
 */
function App() {
  const [screen, setScreen] = useState('');

  useEffect(function initialize() {
    document.addEventListener(
      'screen',
      function screenEvent(event) {
        const screenData = event.detail?.screen;

        if (screenData !== null) {
          setScreen(screenData);
        }
      },
      false
    );
  }, []);

  return <div className="App">{screen && <Screen screen={screen} />}</div>;
}

export default App;
