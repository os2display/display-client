import React from 'react';
import { render } from 'react-dom';
import TextBox from '../../src/text-box/text-box';

const content = {
  title: 'Slide 1',
  text:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  media: [
    {
      id: 'uniqueMedia1',
      url: './fixtures/mountain1.jpeg'
    }
  ],
  boxAlign: 'top'
};

const App = () => (
  <div>
    <h1>Examples</h1>
    <TextBox content={content} />
  </div>
);
render(<App />, document.getElementById('root'));
