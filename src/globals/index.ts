// @ts-nocheck

import path from 'path';
import axios from 'axios';
import fs from 'fs-extra';
import { globby } from 'globby';

import { loadDep } from './dep';
import { $, cd, pwd, ls, readTextFile, writeTextFile, sleep } from './globals';

export async function registerGlobal(preset?: string) {
  global.$ = $;
  global.cd = cd;
  global.pwd = pwd;
  global.ls = ls;
  global.path = path;
  global.fs = fs;
  global.readTextFile = readTextFile;
  global.writeTextFile = writeTextFile;
  global.glob = globby;
  global.globby = globby;
  global.sleep = sleep;
  global.http = axios;
  global.axios = axios;

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

  await loadDep(preset);
}
