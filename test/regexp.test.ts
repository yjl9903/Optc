import { describe, it, expect } from 'vitest';

import { exportDefaultFunctionRE, getExportFunction } from '../src/reflect';

describe('Regexp Reflection', () => {
  it('should accept by RE', () => {
    expect(exportDefaultFunctionRE.test('export default function() {}')).toBeTruthy();
    expect(exportDefaultFunctionRE.test('export default function () {}')).toBeTruthy();
    expect(exportDefaultFunctionRE.test('export default function  () {}')).toBeTruthy();
    expect(exportDefaultFunctionRE.test('export default function   () {}')).toBeTruthy();
  });

  it('parse export function', () => {
    const fns = [
      'export function hello(root?: string, text: string) {}',
      'export function echo(messages: string[]) {}',
      'export default function (text: string) {}'
    ];

    expect(getExportFunction(fns[0])).toMatchInlineSnapshot(`
      [
        {
          "default": false,
          "description": "",
          "name": "hello",
          "options": [],
          "parameters": [
            {
              "name": "root",
              "required": false,
              "type": "string",
            },
            {
              "name": "text",
              "required": true,
              "type": "string",
            },
          ],
        },
      ]
    `);

    expect(getExportFunction(fns[1])).toMatchInlineSnapshot(`
      [
        {
          "default": false,
          "description": "",
          "name": "echo",
          "options": [],
          "parameters": [
            {
              "name": "messages",
              "required": true,
              "type": "string[]",
            },
          ],
        },
      ]
    `);

    expect(getExportFunction(fns[2])).toMatchInlineSnapshot(`
      [
        {
          "default": true,
          "description": "",
          "name": "",
          "options": [],
          "parameters": [
            {
              "name": "text",
              "required": true,
              "type": "string",
            },
          ],
        },
      ]
    `);

    expect(getExportFunction('export default function hello(text?: string) {}'))
      .toMatchInlineSnapshot(`
      [
        {
          "default": true,
          "description": "",
          "name": "hello",
          "options": [],
          "parameters": [
            {
              "name": "text",
              "required": false,
              "type": "string",
            },
          ],
        },
      ]
    `);

    expect(getExportFunction(fns.join('\n'))).toMatchInlineSnapshot(`
      [
        {
          "default": false,
          "description": "",
          "name": "hello",
          "options": [],
          "parameters": [
            {
              "name": "root",
              "required": false,
              "type": "string",
            },
            {
              "name": "text",
              "required": true,
              "type": "string",
            },
          ],
        },
        {
          "default": false,
          "description": "",
          "name": "echo",
          "options": [],
          "parameters": [
            {
              "name": "messages",
              "required": true,
              "type": "string[]",
            },
          ],
        },
        {
          "default": true,
          "description": "",
          "name": "",
          "options": [],
          "parameters": [
            {
              "name": "text",
              "required": true,
              "type": "string",
            },
          ],
        },
      ]
    `);

    expect(getExportFunction('export default async function() {}')).toMatchInlineSnapshot(`
      [
        {
          "default": true,
          "description": "",
          "name": "",
          "options": [],
          "parameters": [],
        },
      ]
    `);

    expect(getExportFunction('export  async  function hello () {}')).toMatchInlineSnapshot(`
      [
        {
          "default": false,
          "description": "",
          "name": "hello",
          "options": [],
          "parameters": [],
        },
      ]
    `);
  });

  it('parse option', () => {
    const inter = `interface Option { root: string; port?: number; open: boolean; }`;
    const fn = `export default function (option: Option) {}`;
    expect(getExportFunction(inter + '\n' + fn)).toMatchInlineSnapshot(`
      [
        {
          "default": true,
          "description": "",
          "name": "",
          "options": [
            {
              "description": "",
              "name": "root",
              "required": true,
              "type": "string",
            },
            {
              "description": "",
              "name": "port",
              "required": false,
              "type": "number",
            },
            {
              "description": "",
              "name": "open",
              "required": true,
              "type": "boolean",
            },
          ],
          "parameters": [],
        },
      ]
    `);
  });
});
