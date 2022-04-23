import * as fs from 'fs-extra';
import path from 'path';

import { $, cd, pwd, readFile } from './globals';

const keys = [
  'copy',
  'mkdirp',
  'move',
  'outputFile',
  'readJson',
  'outputJson',
  'remove',
  'writeJson',
  'emptyDir',
  'ensureFile',
  'ensureDir'
];

export function registerGlobal() {
  // @ts-ignore
  global.$ = $;
  // @ts-ignore
  global.cd = cd;
  // @ts-ignore
  global.pwd = pwd;
  // @ts-ignore
  global.path = path;
  // @ts-ignore
  global.fs = fs;
  // @ts-ignore
  global.readFile = readFile;

  for (const key of keys) {
    // @ts-ignore
    global[key] = fs[key];
  }
}
