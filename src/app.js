import { React, useEffect, useState } from 'react';
import './app.scss';
import Screen from './screen';

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

  return <>{content && <Screen screen={content} />}</>;
}

export default App;
