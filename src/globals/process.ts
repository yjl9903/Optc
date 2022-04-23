import { spawn } from 'child_process';

interface ProcessOption {
  cwd?: string;
  verbose?: boolean;
  shell?: boolean | string;
}

export function Process(
  cmd: string,
  { cwd = process.cwd(), verbose = true, shell = true }: ProcessOption = {}
): Promise<ProcessResult> {
  return new Promise((res) => {
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
