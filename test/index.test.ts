import { describe, expect, it } from 'vitest';

import { bootstrap } from '../src';

describe('Preset', () => {
  it('should work', async () => {
    expect(await bootstrap('test/fixtures/msg.ts')).toMatchInlineSnapshot('"Hello, world."');
  });
});
