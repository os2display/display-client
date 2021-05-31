import { React, useState, useEffect } from 'react';

function TestComponent() {
  const [content, setContent] = useState('');
  const [error, setError] = useState(false);

  useEffect(function initialize() {
    document.addEventListener(
      'content',
      function newContent(event) {
        const data = event.detail;
        if (data.name === 'Error errorsen') {
          setError(true);
        }
        setContent(data);
      },
      false,
    );
  }, []);

  const name = content?.name ?? 'no name';

  if (error) {
    throw new Error('I crashed!');
  }

  return <div>{name}</div>;
}
export default TestComponent;
