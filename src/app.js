/* eslint-disable react/prop-types */
import { React, useEffect, useState } from 'react';
import './app.scss';
import TextBox from './templates/text-box/text-box';

const style = {
  width: '100%',
  height: '100%',
  margin: '0',
  padding: '0'
};

function Slide({ slide }) {
  console.log('Slide', slide);
  return <div style={style}>{slide?.content && <TextBox content={slide.content} />}</div>;
}

function Channel({ channel, id }) {
  console.log('Channel', channel);
  return (
    <div style={style}>
      {channel?.slides?.length > 0 &&
        channel.slides.map((slide) => <Slide key={`${id}-${slide.id}`} id={`${id}-${slide.id}`} slide={slide} />)}
    </div>
  );
}

function Region({ region }) {
  console.log('Region', region);
  return (
    <div style={style}>
      {region?.channels?.length > 0 &&
        region.channels.map((channel) => (
          <Channel key={`${region.id}-${channel.id}`} id={`${region.id}-${channel.id}`} channel={channel} />
        ))}
    </div>
  );
}

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

  // return <div className="App">{content?.content && <TextBox content={content.content} />}</div>;
  return <>{content && <Region region={content} />}</>;
}

export default App;
