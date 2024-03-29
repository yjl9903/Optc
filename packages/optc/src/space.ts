import os from 'node:os';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findUpSync } from 'find-up';

import { version } from '../package.json';

export const OPTC_CACHE = process.env.OPTC_CACHE === 'false' ? false : true;

export const OPTC_ROOT = process.env.OPTC_ROOT
  ? path.resolve(process.env.OPTC_ROOT)
  : path.join(os.homedir(), '.optc');

const NODE_MODULES = findUpSync('node_modules', { type: 'directory' });
export const CACHE_ROOT = NODE_MODULES
  ? path.join(NODE_MODULES, '.cache/optc')
  : path.join(OPTC_ROOT, '.cache');

export async function ensureSpace() {
  await fs.ensureDir(OPTC_ROOT);
  const dep = path.join(OPTC_ROOT, 'dep.ts');
  const pkg = path.join(OPTC_ROOT, 'package.json');
  const optcDts = path.join(OPTC_ROOT, 'optc.d.ts');
  const globalDts = path.join(OPTC_ROOT, 'globals.d.ts');
  if (!fs.existsSync(pkg)) {
    await fs.writeFile(
      pkg,
      JSON.stringify(
        {
          name: 'optc-workspace',
          private: true,
          dependencies: {},
          optc: {
            version
          }
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
  if (!fs.existsSync(globalDts)) {
    const dts = path.join(fileURLToPath(import.meta.url), '../../../globals.d.ts');
    const body = `/// <reference path="${dts}" />`;
    await fs.writeFile(globalDts, body, 'utf-8');
  }
  if (!fs.existsSync(optcDts)) {
    const body = `/// <reference path="./optc.d.ts" />`;
    await fs.writeFile(optcDts, body, 'utf-8');
  }
}
