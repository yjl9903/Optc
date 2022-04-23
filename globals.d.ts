declare function cd(dir: string): void;

declare function pwd(): string;

declare const $: Dollar;

interface Dollar {
  (pieces: string, ...args: string[]): void;

  verbose: boolean;

  prompt: string;
}
