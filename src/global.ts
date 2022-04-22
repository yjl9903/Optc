import path from 'path';

export function registerGlobal() {
  // @ts-ignore
  global.cd = cd;
  // @ts-ignore
  global.pwd = pwd;
  // @ts-ignore
  global.$ = $;
}

$.prompt = '$';
$.verbose = true;

function $(pieces: string, ...args: string[]) {}

let currentDir = process.cwd();
function cd(dir: string) {
  print(`${$.prompt} cd ${dir}`);
  currentDir = path.resolve(currentDir, dir);
}

function pwd() {
  print(currentDir);
  return currentDir;
}

function print(msg: string) {
  if ($.verbose) {
    console.log(msg);
  }
}
