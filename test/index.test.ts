import { describe, expect, it } from 'vitest';

import { bootstrap } from '../src';

describe('Echo', () => {
  it('should work', () => {
    expect(async () => await bootstrap('examples/echo.ts', 'test')).not.toThrow();
  });
});

describe('Preset', () => {
  it('should work', async () => {
    expect(await bootstrap('test/fixtures/msg.ts')).toMatchInlineSnapshot('"Hello, world."');
  });
});
