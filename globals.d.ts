import * as path from 'path';
import * as fs from 'fs-extra';

import type { ProcessResult } from './dist';

declare global {
  /**
   * Change directory
   *
   * @param dir
   */
  declare function cd(dir: string): void;

  /**
   * Print working directory
   *
   * @returns working directory
   */
  declare function pwd(): string;

  /**
   * Exec command
   */
  declare const $: Dollar;

  /**
   * path
   */
  declare const path: typeof path;

  /**
   * fs-extra
   */
  declare const fs: typeof fs;

  declare const readFile: (filename: string) => string;
  declare const copy: typeof fs.copy;
  declare const mkdirp: typeof fs.mkdirp;
  declare const move: typeof fs.move;
  declare const outputFile: typeof fs.outputFile;
  declare const readJson: typeof fs.readJson;
  declare const outputJson: typeof fs.outputJson;
  declare const remove: typeof fs.remove;
  declare const writeJson: typeof fs.writeJson;
  declare const emptyDir: typeof fs.emptyDir;
  declare const ensureFile: typeof fs.ensureFile;
  declare const ensureDir: typeof fs.ensureDir;
}

interface Dollar {
  (pieces: TemplateStringsArray, ...args: any[]): Promise<ProcessResult>;

  verbose: boolean;

  prompt: string;
}
