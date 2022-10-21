import { describe, expect, it } from 'vitest';

import { bootstrap, makeOptc } from '../src';

describe('Examples', () => {
  it('http', () => {
    expect(() => bootstrap('examples/http.ts', 'http://numbersapi.com/42')).not.toThrow();
  });

  it('node', () => {
    expect(() => bootstrap('examples/node.ts')).not.toThrow();
  });

  it('pkg', () => {
    expect(() => bootstrap('examples/pkg.ts', '--root', '.')).not.toThrow();
  });

  it('process', async () => {
    expect((await bootstrap('test/fixtures/process.ts', 'hello')).stdout).toEqual('hello\n');
  });
});

describe('Preset', async () => {
  const cli = await makeOptc('test/fixtures/msg.ts');

  it('should work', async () => {
    expect(await cli.run(['msg'])).toMatchInlineSnapshot('"Hello, world."');
  });
});
