import { $, cd, pwd } from './globals';

export function registerGlobal() {
  // @ts-ignore
  global.$ = $;
  // @ts-ignore
  global.cd = cd;
  // @ts-ignore
  global.pwd = pwd;
}
