import { React, useState } from 'react';
import './debug-bar.scss';

function DebugBar() {
  const [show, setShow] = useState(true);

  const fixtures = [
    {
      key: 'debug-bar-fixture-1',
      title: 'slide: text-box top',
      file: './fixtures/text-box/slide1.json'
    },
    {
      key: 'debug-bar-fixture-2',
      title: 'slide: text-box left',
      file: './fixtures/text-box/slide2.json'
    },
    {
      key: 'debug-bar-fixture-3',
      title: 'slide: text-box right',
      file: './fixtures/text-box/slide3.json'
    },
    {
      key: 'debug-bar-fixture-4',
      title: 'slide: text-box bottom',
      file: './fixtures/text-box/slide4.json'
    },
    {
      key: 'debug-bar-fixture-5',
      title: 'slide: text-box colors',
      file: './fixtures/text-box/slide5.json'
    },
    {
      key: 'debug-bar-fixture-6',
      title: 'slideshow1',
      file: './fixtures/slideshow/slideshow1.json'
    },
    {
      key: 'debug-bar-fixture-7',
      title: 'slideshow2',
      file: './fixtures/slideshow/slideshow2.json'
    }
  ];

  function loadContent(fixture) {
    fetch(fixture)
      .then((response) => response.json())
      .then((jsonData) => {
        const event = new CustomEvent('content', {
          detail: jsonData
        });
        document.dispatchEvent(event);
      });
  }

  return (
    <>
      {show && (
        <div className="debug-bar">
          <div className="debug-bar-header">Debug</div>
          <div className="debug-bar-content">
            {fixtures.map((fixture) => (
              <button
                className="debug-bar-button"
                type="button"
                id={fixture.key}
                key={fixture.key}
                onClick={() => {
                  loadContent(fixture.file);
                }}
              >
                {fixture.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="debug-bar-toggle-button" type="button" onClick={() => setShow(!show)}>
        {show ? 'Hide' : 'Debug'}
      </button>
    </>
  );
}

export default DebugBar;
