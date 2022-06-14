// @ts-nocheck

import path from 'path';
import axios from 'axios';
import { globby } from 'globby';
import * as fs from 'fs-extra';

import { $, cd, pwd, ls, readFile, sleep } from './globals';

export async function registerGlobal() {
  global.$ = $;
  global.cd = cd;
  global.pwd = pwd;
  global.ls = ls;
  global.path = path;
  global.fs = fs;
  global.readFile = readFile;
  global.glob = globby;
  global.sleep = sleep;
  global.http = axios;

  for (const key of [
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
  ]) {
    global[key] = fs[key];
  }
}
