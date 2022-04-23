import path from 'path';
import globby from 'globby';
import * as fs from 'fs-extra';

import { $, cd, pwd, readFile, sleep } from './globals';

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
  // @ts-ignore
  global.globby = globby;
  // @ts-ignore
  global.sleep = sleep;

  for (const key of keys) {
    // @ts-ignore
    global[key] = fs[key];
  }
}
