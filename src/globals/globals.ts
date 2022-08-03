import { readdirSync, readFileSync, writeFileSync, EncodingOption } from 'node:fs';

import { Process } from './process';

$.prompt = '$';
$.shell = true;
$.verbose = true;

export function $(pieces: TemplateStringsArray, ...args: any[]) {
  return Process(pieces, args, { cwd: process.cwd(), verbose: $.verbose, shell: $.shell });
}

export function cd(dir: string) {
  print(`${$.prompt} cd ${dir}`);
  process.chdir(dir);
}

export function pwd() {
  print(process.cwd());
  return process.cwd();
}

export function ls(dir?: string): string[] {
  return readdirSync(dir ?? process.cwd());
}

export function readTextFile(filename: string, encode: EncodingOption = 'utf-8') {
  return readFileSync(filename, encode);
}

export function writeTextFile(filename: string, content: string, encode: EncodingOption = 'utf-8') {
  return writeFileSync(filename, content, encode);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), ms));
}

function print(msg: string) {
  if ($.verbose) {
    console.log(msg);
  }
}
