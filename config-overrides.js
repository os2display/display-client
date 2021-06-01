// config-overrides.js
// eslint-disable-next-line no-unused-vars
module.exports = function override(config, env) {
  console.log('overrides!!!');
  // eslint-disable-next-line no-param-reassign
  config.resolve.alias = {
    'remote-component.config.js': `${__dirname}/src/remote-component.config.js`
  };

  return config;
};
