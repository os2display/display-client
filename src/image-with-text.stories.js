import React from 'react';
import ImageWithText from './image-with-text';

export default {
  title: 'Example/ImageWithText',
  component: ImageWithText,
};

const Template = (args) => <ImageWithText {...args} />;

export const primary = Template.bind({});
primary.args = {};
