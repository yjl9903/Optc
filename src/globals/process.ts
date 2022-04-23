import { spawn } from 'child_process';

export function Process(
  cmd: string,
  { cwd = process.cwd(), verbose = true }: { cwd?: string; verbose?: boolean } = {}
): Promise<string> {
  return new Promise((res) => {
    setTimeout(() => {
      if (verbose) {
        console.log(`$ ${cmd}`);
      }

      const child = spawn(cmd, {
        cwd,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      });

      let stdout = '';
      const onStdout = (data: string) => {
        if (verbose) {
          process.stdout.write(data);
        }
        stdout += data;
      };
      child.stdout.on('data', onStdout);

      child.on('close', () => res(stdout));
    }, 0);
  });
}
