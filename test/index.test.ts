import { describe, expect, it } from 'vitest';

import { bootstrap } from '../src';

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
});

describe('Preset', () => {
  it('should work', async () => {
    expect(await bootstrap('test/fixtures/msg.ts')).toMatchInlineSnapshot('"Hello, world."');
  });
});
