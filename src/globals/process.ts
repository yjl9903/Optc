import { spawn } from 'node:child_process';

interface ProcessOption {
  cwd?: string;
  verbose?: boolean;
  shell?: boolean | string;
}

export function Process(
  pieces: TemplateStringsArray,
  args: any[],
  { cwd = process.cwd(), verbose = true, shell = true }: ProcessOption = {}
): Promise<ProcessResult> {
  const parseCmd = () => {
    const escape = (arg: any) => {
      if (typeof arg === 'string') {
        if (arg === '' || /^[a-z0-9/_.-]+$/i.test(arg)) {
          return arg;
        } else {
          return `'${arg
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\f/g, '\\f')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\v/g, '\\v')
            .replace(/\0/g, '\\0')}'`;
        }
      } else if (arg instanceof ProcessResult) {
        throw new Error('Unimplement');
      } else {
        throw new Error('Unreachable');
      }
    };

    const cmd = [pieces[0]];
    let i = 0;
    while (i < args.length) {
      if (Array.isArray(args[i])) {
        cmd.push(args.map(escape).join(' '));
      } else {
        cmd.push(escape(args[i]));
      }
      cmd.push(pieces[++i]);
    }

    return cmd.join('');
  };

  return new Promise((res) => {
    const cmd = parseCmd();

    setTimeout(() => {
      if (verbose) {
        console.log(`$ ${cmd}`);
      }

      const child = spawn(cmd, {
        cwd,
        shell,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });

      let stdout = '',
        stderr = '',
        combined = '';
      const onStdout = (data: string) => {
        if (verbose) {
          process.stdout.write(data);
        }
        stdout += data;
        combined += data;
      };
      const onStderr = (data: string) => {
        if (verbose) process.stderr.write(data);
        stderr += data;
        combined += data;
      };
      child.stdout.on('data', onStdout);
      child.stderr.on('data', onStderr);

      child.on('close', (code, signal) => {
        const result = new ProcessResult({ code, signal, stdout, stderr, combined });
        res(result);
      });
    }, 0);
  });
}

export class ProcessResult {
  readonly code: number | null;
  readonly signal: string | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly combined: string;

  constructor({
    code,
    signal,
    stdout,
    stderr,
    combined
  }: {
    code: number | null;
    signal: string | null;
    stdout: string;
    stderr: string;
    combined: string;
  }) {
    this.code = code;
    this.signal = signal;
    this.stdout = stdout;
    this.stderr = stderr;
    this.combined = combined;
  }
}
