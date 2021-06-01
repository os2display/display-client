import { React, useState } from 'react';
import './debug-bar.scss';

function DebugBar() {
  const [show, setShow] = useState(true);

  const fixtures = [
    {
      key: 'debug-bar-fixture-1',
      title: 'slide: text-box top',
      file: './fixtures/slide1.json',
    },
    {
      key: 'debug-bar-fixture-2',
      title: 'slide: text-box left',
      file: './fixtures/slide2.json',
    },
    {
      key: 'debug-bar-fixture-3',
      title: 'slide: text-box right',
      file: './fixtures/slide3.json',
    },
    {
      key: 'debug-bar-fixture-4',
      title: 'slide: text-box bottom',
      file: './fixtures/slide4.json',
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

      <button
        className="debug-bar-toggle-button"
        type="button"
        onClick={() => setShow(!show)}
      >
        {show ? 'Hide' : 'Debug'}
      </button>
    </>
  );
}

export default DebugBar;
