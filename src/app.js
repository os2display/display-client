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
  const [content, setContent] = useState('');

  useEffect(function initialize() {
    document.addEventListener(
      'content',
      function newContent(event) {
        const data = event.detail;
        setContent(data);
      },
      false
    );
  }, []);

  return <div className="App">{content && <Screen screen={content} />}</div>;
}

export default App;
