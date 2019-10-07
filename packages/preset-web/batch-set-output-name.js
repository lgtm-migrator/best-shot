'use strict';

module.exports = function setOutputName({ script, style }) {
  return chain => {
    const jsFilename = chain.output.get('filename');

    chain.output.filename(script(jsFilename));

    if (chain.plugins.has('extract-css')) {
      chain
        .plugin('extract-css')
        .tap(([{ /* chunkFilename,  */ filename, ...options }]) => [
          {
            ...options,
            filename: style(filename)
            // chunkFilename: style(chunkFilename)
          }
        ]);
    }
  };
};
