/**
 * Change directory
 *
 * @param dir
 */
declare function cd(dir: string): void;

/**
 * Print working directory
 *
 * @returns working directory
 */
declare function pwd(): string;

declare const $: Dollar;

interface Dollar {
  (pieces: string, ...args: string[]): void;

  verbose: boolean;

  prompt: string;
}
