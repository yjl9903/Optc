import path from 'path';
import { Process } from './process';

$.prompt = '$';
$.verbose = true;

let workingDir = process.cwd();

export function $(pieces: TemplateStringsArray, ...args: any[]) {
  const parseCmd = () => {
    const escape = (arg: string) => {
      if (arg === '' || /^[a-z0-9/_.-]+$/i.test(arg)) {
        return arg;
      } else {
        return `$'${arg
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/\f/g, '\\f')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\v/g, '\\v')
          .replace(/\0/g, '\\0')}'`;
      }
    };

    const cmd = [pieces[0]];
    let i = 0;
    while (i < args.length) {
      if (Array.isArray(args[i])) {
        cmd.push(...args.map(escape));
      } else {
        cmd.push(escape(args[i]));
      }
      cmd.push(pieces[++i]);
    }

    return cmd.join(' ');
  };

  return Process(parseCmd(), { cwd: workingDir, verbose: $.verbose });
}

export function cd(dir: string) {
  print(`${$.prompt} cd ${dir}`);
  workingDir = path.resolve(workingDir, dir);
}

export function pwd() {
  print(workingDir);
  return workingDir;
}

function print(msg: string) {
  if ($.verbose) {
    console.log(msg);
  }
}
