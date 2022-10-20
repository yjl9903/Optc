import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

export const OPTC_ROOT = process.env.OPTC_ROOT
  ? path.resolve(process.env.OPTC_ROOT)
  : path.join(os.homedir(), '.optc');

export const CACHE_ROOT = path.join(OPTC_ROOT, '.cache');

export async function ensureSpace() {
  await fs.ensureDir(OPTC_ROOT);
  const dep = path.join(OPTC_ROOT, 'dep.ts');
  const pkg = path.join(OPTC_ROOT, 'package.json');
  const dts = path.join(OPTC_ROOT, 'globals.d.ts');
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
  if (!fs.existsSync(dts)) {
    const globalsDts = path.join(fileURLToPath(import.meta.url), '../../globals.d.ts');
    const body = `/// <reference path="${globalsDts}" />`;
    await fs.writeFile(dts, body, 'utf-8');
  }
}
