'use strict';

const cloneDeep = require('lodash/cloneDeep');
const sortObject = require('sort-object');
const BestShot = require('@best-shot/core');
const { commandEnv } = require('@best-shot/cli/lib/utils');

const {
  reachPackages,
  reachConfig,
  reachBrowsers
} = require('@best-shot/cli/lib/reach');
const concatStr = require('./concat-str');
const makeWriteFile = require('./write-file');

const commands = ['serve', 'watch', 'dev', 'prod'];

module.exports = function inspector({ platforms = [''], stamp = 'none' }) {
  const rootPath = process.cwd();
  const configFunc = reachConfig(rootPath);
  const packages = reachPackages(rootPath);
  const writeFile = makeWriteFile(rootPath, stamp);

  console.log('Output files ...');

  platforms.forEach(_ => {
    const platform = _ || undefined;
    commands.forEach(command => {
      const mode = commandEnv(command);
      const browsers = reachBrowsers(rootPath, mode);

      const { webpackChain, presets, ...config } = cloneDeep(
        configFunc({
          command,
          platform
        })
      );

      if (command === 'serve') {
        presets.unshift('serve');
      }

      const io = new BestShot({ presets });

      writeFile({
        name: `${platform ? `${platform}/` : ''}${command}.js`,
        data: concatStr({
          stamp,
          input: sortObject({
            platform,
            mode,
            browsers,
            command,
            presets,
            config,
            webpackChain
          }),
          schema: io.schema.toObject(),
          output: io
            .load({
              options: {
                watch: ['watch', 'serve'].includes(command)
              },
              browsers,
              config,
              packages,
              platform,
              rootPath
            })
            .when(typeof webpackChain === 'function', webpackChain)
        })
      });
    });
  });

  writeFile({
    name: 'packages.json',
    data: JSON.stringify(packages, null, '  ')
  });
};
