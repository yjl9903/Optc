import { describe, expect, it } from 'vitest';

import { bootstrap } from '../src/core';

describe('hello', () => {
  it('should work', () => {
    expect(async () => await bootstrap('examples/echo.ts', 'test')).not.toThrow();
  });
});
