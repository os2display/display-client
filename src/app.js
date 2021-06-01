import { React, useEffect, useState } from 'react';
import TextBox from './templates/text-box/text-box';
import './app.scss';

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

  return <div className="App">{content?.content && <TextBox content={content.content} />}</div>;
}

export default App;
