'use strict';

const webpack = require('webpack');

function getServer() {
  try {
    // eslint-disable-next-line max-len
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies, import/no-unresolved, node/no-missing-require
    return require('@best-shot/dev-server');
  } catch (error) {
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      return require('best-shot-dev-server');
    } catch (_error) {
      return undefined;
    }
  }
}

module.exports = function handle(command, chain) {
  const {
    watch,
    watchOptions,
    stats: statsConfig,
    devServer,
    ...config
  } = chain.toConfig();

  function showStats(err, stats) {
    if (err) {
      console.error(err);
    }
    console.log(stats.toString(statsConfig));
  }

  if (command === 'serve') {
    const server = getServer();
    if (server) {
      server({
        devServer,
        watchOptions,
        stats: statsConfig,
        ...config
      });
    }
  } else {
    const compiler = webpack(config);
    if (command === 'watch') {
      compiler.watch(watchOptions, showStats);
    } else {
      compiler.run(showStats);
    }
  }
};
