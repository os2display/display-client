import { React, useEffect, useState } from 'react';

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

  const name = content?.name ?? 'no name';
  const image = content?.image;
  const video = content?.video;

  return (
    <div className="App">
      <div>Display client</div>
      <div>{name}</div>
      {image && <img src={image} alt="s" />}
      {video && (
        <video controls width="250">
          <source src={video} type="video/webm" />
          Video
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}

export default App;
