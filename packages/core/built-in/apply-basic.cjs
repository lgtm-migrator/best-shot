'use strict';

const { resolve } = require('path');

exports.name = 'basic';

exports.apply = function applyBasic({
  config: { output: { publicPath, path } = {}, target },
}) {
  return (chain) => {
    chain.amd(false);

    if (target) {
      chain.target(target);
    }

    const context = chain.get('context');
    const mode = chain.get('mode');
    const watch = chain.get('watch');

    chain.optimization
      .removeAvailableModules(true)
      .minimize(mode === 'production');

    if (watch) {
      chain.watchOptions({ ignored: /node_modules/ });
      chain.output.pathinfo(false);
      chain.optimization
        .removeAvailableModules(false)
        .removeEmptyChunks(false)
        .set('innerGraph', false);
    }

    chain.module.strictExportPresence(!watch);

    const name = chain.get('name') || '';

    if (publicPath !== undefined) {
      chain.output.publicPath(publicPath);
    }

    chain.output
      .filename('[name].js')
      .path(
        resolve(
          context,
          path.replace(/\[config-name]/g, name).replace(/\[mode]/g, mode),
        ),
      );

    if (!watch) {
      chain.output.set('clean', true);
    }
  };
};

const string = { type: 'string' };

exports.schema = {
  output: {
    type: 'object',
    default: {},
    properties: {
      path: {
        default: 'dist',
        description:
          'It can be a relative path. Additional placeholder: [mode][config-name]',
        minLength: 3,
        type: 'string',
      },
    },
  },
  target: {
    title: 'Same as `target` of `webpack` configuration',
    oneOf: [
      string,
      {
        type: 'array',
        uniqueItems: true,
        items: string,
      },
    ],
  },
};
