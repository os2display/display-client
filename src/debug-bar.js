import { React } from 'react';
import './debug-bar.scss';

function DebugBar() {
  const fixtures = [
    {
      key: 'debug-bar-fixture-1',
      title: 'Slide 1',
      file: './fixtures/slide1.json',
    },
    {
      key: 'debug-bar-fixture-2',
      title: 'Slide 2',
      file: './fixtures/slide2.json',
    },
    {
      key: 'debug-bar-fixture-3',
      title: 'Slide 3',
      file: './fixtures/slide3.json',
    },
    {
      key: 'debug-bar-fixture-4',
      title: 'Slide 4',
      file: './fixtures/slide4.json',
    },
  ];

  function loadContent(fixture) {
    fetch(fixture)
      .then((response) => response.json())
      .then((jsonData) => {
        const event = new CustomEvent('content', {
          detail: jsonData,
        });
        document.dispatchEvent(event);
      });
  }

  return (
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
  );
}

export default DebugBar;
