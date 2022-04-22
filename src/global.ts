import path from 'path';

export function registerGlobal() {
  // @ts-ignore
  global.cd = cd;
}

let currentDir = process.cwd();
function cd(dir: string) {
  currentDir = path.resolve(currentDir, dir);
}
