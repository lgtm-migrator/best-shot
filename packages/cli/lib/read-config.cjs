const { resolve } = require('path');
const slash = require('slash');
const { cyan } = require('chalk');

const prompt = require('./prompt.cjs');
const validate = require('./validate.cjs');

function isSafeError(error) {
  return (
    error.code === 'MODULE_NOT_FOUND' && error.requireStack[0] === __filename
  );
}

// eslint-disable-next-line consistent-return
function readConfigFile(filename, rootPath = process.cwd()) {
  try {
    return require(resolve(rootPath, '.best-shot', filename));
  } catch (error) {
    if (!isSafeError(error)) {
      throw error;
    }
  }
}

async function requireConfig(rootPath) {
  return (
    readConfigFile('config.cjs', rootPath) ||
    readConfigFile('config.js', rootPath) ||
    {}
  );
}

module.exports = function readConfig(
  rootPath,
  interactive = process.stdout.isTTY,
) {
  return async function func({ command, configName }) {
    let config = await requireConfig(rootPath);

    config = typeof config === 'function' ? await config({ command }) : config;

    validate(config);

    const configs = Array.isArray(config) ? config : [config];

    configs.forEach((conf) => {
      if (!conf.outputPath) {
        // eslint-disable-next-line no-param-reassign
        conf.outputPath = slash('.best-shot/build/[config-name]');
      }
    });

    if (configName && configName.length > 0) {
      const names = configs.map(({ name }) => name);
      const matched = configName.filter((name) => names.includes(name));
      if (matched.length > 0) {
        console.log(cyan('CONFIG-NAME:'), matched.join(', '));
        return configs.filter(({ name }) => matched.includes(name));
      }
    }

    if (interactive && configs.length > 1) {
      return prompt(configs);
    }

    return configs;
  };
};
