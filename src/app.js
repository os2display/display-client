import { React, useEffect, useState } from 'react';
import ImageWithText from './image-with-text';

function App() {
  const [content, setContent] = useState('');

  useEffect(function initialize() {
    document.addEventListener(
      'content',
      function newContent(event) {
        const data = event.detail;
        setContent(data);
      },
      false,
    );
  }, []);

  const name = content?.name ?? 'no name';

  return (
    <div className="App">
      <div>Display client</div>
      <div>{name}</div>
      <ImageWithText />
    </div>
  );
}

export default App;
