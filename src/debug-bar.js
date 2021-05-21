import { React } from 'react';
import './debug-bar.scss';

function DebugBar() {
  const fixtures = [
    {
      key: 'debug-bar-fixture-1',
      title: 'Data 1',
      file: './fixtures/data1.json'
    },
    {
      key: 'debug-bar-fixture-2',
      title: 'Data 2',
      file: './fixtures/data2.json'
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
