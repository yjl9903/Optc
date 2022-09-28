import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';

export const OPTC_ROOT = process.env.OPTC_ROOT
  ? path.resolve(process.env.OPTC_ROOT)
  : path.join(os.homedir(), '.optc');

export async function ensureSpace() {
  await fs.ensureDir(OPTC_ROOT);
  const dep = path.join(OPTC_ROOT, 'dep.ts');
  const pkg = path.join(OPTC_ROOT, 'package.json');
  if (!fs.existsSync(pkg)) {
    await fs.writeFile(
      pkg,
      JSON.stringify(
        {
          name: 'optc-workspace',
          private: true,
          dependencies: {}
        },
        null,
        2
      ),
      'utf-8'
    );
  }
  if (!fs.existsSync(dep)) {
    const body = `export default function(global: any) {\n\n}`;
    await fs.writeFile(dep, body, 'utf-8');
  }
}
