import path from 'path';
import globby from 'globby';
import * as fs from 'fs-extra';
import axios from 'axios';

import { $, cd, pwd, readFile, sleep } from './globals';

const fsKeys = [
  'copy',
  'mkdirp',
  'move',
  'remove',
  'outputFile',
  'readJson',
  'writeJson',
  'outputJson',
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
  // @ts-ignore
  global.http = axios;

  for (const key of fsKeys) {
    // @ts-ignore
    global[key] = fs[key];
  }
}
