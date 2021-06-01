import { React, useEffect, useState } from 'react';
import './app.scss';
import { createRemoteComponent, createRequires } from '@paciolan/remote-component';
import { resolve } from './remote-component.config';

const requires = createRequires(resolve);
const RemoteComponent = createRemoteComponent({ requires });

function App() {
  const [content, setContent] = useState('');
  const [url, setURL] = useState(null);

  useEffect(function initialize() {
    document.addEventListener(
      'content',
      function newContent(event) {
        const data = event.detail;
        setContent(data);
      },
      false
    );

    setURL(
      'https://raw.githubusercontent.com/os2display/DisplayClient/poc/remote-component/templates/dist/text-box.bundle.js'
    );
  }, []);

  return (
    <div className="App">{content?.content && url && <RemoteComponent url={url} content={content.content} />}</div>
  );
}

export default App;
