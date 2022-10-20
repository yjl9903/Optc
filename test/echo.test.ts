import { describe, expect, it, should } from 'vitest';

import { makeOptc } from '../src';

describe('Echo', async () => {
  const cli = await makeOptc('examples/echo.ts');

  it('should work', async () => {
    expect(await cli.run(['test'])).toMatchInlineSnapshot('"test"');
  });

  it('should greet', async () => {
    expect(await cli.run(['greet', 'world'])).toMatchInlineSnapshot('"Hello, world"');
  });

  it('should set default arg', async () => {
    expect(await cli.run(['greet'])).toMatchInlineSnapshot('"Hello, Stranger"');
  });
});
