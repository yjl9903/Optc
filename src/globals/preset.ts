import fs from 'fs-extra';
import path from 'node:path';

import { OPTC_ROOT } from '../constant';

export async function loadPreset(name: string = 'dep.ts') {
  const filepath = path.join(OPTC_ROOT, name);
  if (!fs.existsSync(filepath)) return;
  const jiti = (await import('jiti')).default(filepath, { cache: true, sourceMaps: false });
  const module = await jiti(filepath);
  if (module.default && typeof module.default === 'function') {
    await module.default(global);
  }
}
