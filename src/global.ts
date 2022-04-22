import path from 'path';

export function registerGlobal() {
  // @ts-ignore
  global.cd = cd;
  // @ts-ignore
  global.pwd = pwd;
}

let currentDir = process.cwd();
function cd(dir: string) {
  currentDir = path.resolve(currentDir, dir);
}

function pwd() {
  return currentDir;
}
