import { React, useEffect, useState, lazy, Suspense } from 'react';

const TestComponentImport = lazy(() =>
  import('./component/test-component-import'),
);

function App() {
  const [content, setContent] = useState('');
  // eslint-disable-next-line

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
      <Suspense fallback={<h1>Lets hope it works!</h1>}>
        <TestComponentImport />
      </Suspense>
      <div>Display client</div>
      <div>{name}</div>
    </div>
  );
}

export default App;
