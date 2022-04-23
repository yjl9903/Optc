import path from 'path';

$.prompt = '$';
$.verbose = true;

export function $(pieces: string, ...args: string[]) {}

let currentDir = process.cwd();

export function cd(dir: string) {
  print(`${$.prompt} cd ${dir}`);
  currentDir = path.resolve(currentDir, dir);
}

export function pwd() {
  print(currentDir);
  return currentDir;
}

function print(msg: string) {
  if ($.verbose) {
    console.log(msg);
  }
}
