import { React, useEffect, useState } from 'react';
import TextBox from './templates/text-box/text-box';
import Slideshow from './templates/slideshow/slideshow';
import './app.scss';

function App() {
  const [content, setContent] = useState('');
  const [slideshow, setSlideshow] = useState(false);
  useEffect(function initialize() {
    setSlideshow(false);
    document.addEventListener(
      'content',
      function newContent(event) {
        const data = event.detail;
        setContent(null);
        setSlideshow(false);
        if (data.title.includes('Slideshow')) {
          setSlideshow(true);
        }
        setContent(data);
      },
      false
    );
  }, []);

  return (
    <div className="App">
      <>{content?.content && slideshow && <Slideshow content={content.content} />}</>
      <>{content?.content && !slideshow && <TextBox content={content.content} />}</>
    </div>
  );
}

export default App;
