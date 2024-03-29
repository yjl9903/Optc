/// <reference types="@types/node" />
/// <reference types="@total-typescript/ts-reset" />

import * as _path from 'node:path';
import * as _fs from 'fs-extra';
import _axios, { type AxiosInstance as _AxiosInstance } from 'axios';
import { globby as _globby } from 'globby';

import type { ProcessResult } from './dist';

declare global {
  /**
   * Change directory
   *
   * @param dir
   */
  export function cd(dir: string): void;

  /**
   * Print working directory
   *
   * @returns working directory
   */
  export function pwd(): string;

  /**
   * List files
   */
  export function ls(dir?: string): string[];

  /**
   * Exec command
   */
  export const $: Dollar;

  /**
   * path
   */
  export const path: typeof _path;

  /**
   * fs-extra
   */
  export const fs: typeof _fs;

  /**
   * globby
   */
  export const glob: typeof _globby;
  export const globby: typeof _globby;

  /**
   * axios
   */
  export const http: typeof _axios;
  export const axios: typeof _axios;
  export type AxiosInstance = _AxiosInstance;

  /**
   * Read file content helper function
   */
  export const readTextFile: (filename: string) => string;
  export const writeTextFile: (filename: string, content: string) => void;

  export const copy: typeof fs.copy;
  export const mkdirp: typeof fs.mkdirp;
  export const move: typeof fs.move;
  export const outputFile: typeof fs.outputFile;
  export const readJson: typeof fs.readJson;
  export const outputJson: typeof fs.outputJson;
  export const remove: typeof fs.remove;
  export const writeJson: typeof fs.writeJson;
  export const emptyDir: typeof fs.emptyDir;
  export const ensureFile: typeof fs.ensureFile;
  export const ensureDir: typeof fs.ensureDir;
}

interface Dollar {
  (pieces: TemplateStringsArray, ...args: any[]): Promise<ProcessResult>;

  verbose: boolean;

  prompt: string;
}
