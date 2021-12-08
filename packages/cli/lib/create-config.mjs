import { BestShot } from '@best-shot/core';

import { commandMode } from './utils.mjs';

export async function createConfig(
  config,
  { command, batch, watch = false, serve = false },
) {
  const { name, chain, presets = [], ...rest } = config;

  const io = await new BestShot({ name }).setup({
    watch,
    serve,
    mode: commandMode(command),
    presets,
    config: rest,
  });

  return io
    .when(typeof chain === 'function', chain)
    .when(batch, batch)
    .delete('watch')
    .toConfig();
}
