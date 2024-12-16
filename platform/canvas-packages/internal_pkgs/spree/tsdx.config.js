// tsdx.config.js
module.exports = {
  rollup(config, options) {
    if (options.format === 'umd' || options.format === 'cjs') {
      config.plugins = [
        ...config.plugins,
        require('rollup-plugin-polyfill-node')({
          global: true, // Enable global polyfilling
        }),
      ];
    }
    return config;
  },
};
