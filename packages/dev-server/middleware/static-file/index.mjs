import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { Router } from 'express';

const router = Router({ strict: true });

export function staticFile() {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  router.get(
    '/.best-shot/:name(404.svg|logo.svg|logo.png)',
    ({ params: { name } }, res) => {
      res.sendFile(name, { root: __dirname });
    },
  );

  return router;
}
