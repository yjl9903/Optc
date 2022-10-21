import { describe, expect, it } from 'vitest';

import { makeOptc } from '../src';

describe('Refl', () => {
  it('should work', async () => {
    const cli = await makeOptc('test/fixtures/option.ts');
    expect(cli.getRawCommands()).toMatchInlineSnapshot(`
      [
        {
          "default": true,
          "description": "This is a default command",
          "name": "",
          "options": [
            {
              "description": "This is root",
              "name": "root",
              "required": true,
              "type": "string",
            },
          ],
          "parameters": [],
        },
        {
          "default": false,
          "description": "Say hello",
          "name": "hello",
          "options": [
            {
              "description": "",
              "name": "recv",
              "required": true,
              "type": "string",
            },
          ],
          "parameters": [
            {
              "name": "msg",
              "required": true,
              "type": "string[]",
            },
          ],
        },
      ]
    `);
  });
});
