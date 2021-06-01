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
      false,
    );
  }, []);

  const slide1 = {
    title: 'Cool headline',
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    media: [
      {
        id: 'uniqueMedia1',
        url: './fixtures/mountain1.jpeg',
      },
    ],
    boxAlign: 'right',
  };

  return (
    <div className="App">
      <TextBox content={slide1} />
      {content && <div>{content.text}</div>}
    </div>
  );
}

export default App;
