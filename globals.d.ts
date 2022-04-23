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
  (pieces: TemplateStringsArray, ...args: any[]): Promise<void>;

  verbose: boolean;

  prompt: string;
}
