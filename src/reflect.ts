import { readFileSync } from 'fs';

export enum ValueType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'string[]'
}

export interface Argument {
  name: string;
  type: ValueType;
  required: boolean;
}

export interface Command {
  name: string;
  arguments: Argument[];
  default: boolean;
}

const exportDefaultFunctionRE = /\bexport\s+default\s+function(\s*[a-zA-Z0-9_\-]*)\s*\(([^)]*)\)/;
const exportFunctionRE = /\bexport\s+function\s+([a-zA-Z0-9_\-]+)\s*\(([^)]*)\)/g;

export function reflect(script: string) {
  const content = readFileSync(script, 'utf-8');
  return getExportFunction(content);
}

function getExportFunction(content: string): Command[] {
  const transform = (match: RegExpExecArray): Command => {
    const arg = match[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        if (s.includes(':')) {
          const pos = s.indexOf(':');

          if (pos === 0) {
            // TODO: warning
            return undefined;
          }
          const required = s[pos - 1] !== '?';

          const name = s.slice(0, pos - (required ? 0 : 1)).trim();
          const type = s.slice(pos + 1).trim();

          if (!isValueType(type)) {
            // TODO: warning
            return undefined;
          }

          return {
            name,
            type: type as ValueType,
            required
          };
        } else {
          return {
            name: s,
            type: ValueType.String,
            required: true
          };
        }
      })
      .filter(Boolean) as Argument[];

    const name = match[1].trim();

    return {
      name,
      arguments: arg,
      default: false
    };
  };

  const commands = matchAll(content, exportFunctionRE).map(transform);
  const defaultCommand = exportDefaultFunctionRE.exec(content);
  if (defaultCommand) {
    const cmd = transform(defaultCommand);
    cmd.default = true;
    commands.push(cmd);
  }

  return commands;
}

function isValueType(type: string): type is ValueType {
  if (type === 'string') return true;
  if (type === 'number') return true;
  if (type === 'boolean') return true;
  if (type === 'string[]') return true;
  return false;
}

function matchAll(str: string, re: RegExp): RegExpExecArray[] {
  let cap: RegExpExecArray | null;
  const all = [];
  while ((cap = re.exec(str)) !== null) {
    all.push(cap);
  }
  return all;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('parse export function', () => {
    const fns = [
      'export function hello(root?: string, text: string) {}',
      'export default function (text: string) {}'
    ];

    expect(getExportFunction(fns[0])).toMatchInlineSnapshot(`
      [
        {
          "arguments": [
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
          "default": false,
          "name": "hello",
        },
      ]
    `);

    expect(getExportFunction(fns[1])).toMatchInlineSnapshot(`
      [
        {
          "arguments": [
            {
              "name": "text",
              "required": true,
              "type": "string",
            },
          ],
          "default": true,
          "name": "",
        },
      ]
    `);

    expect(getExportFunction('export default function hello(text?: string) {}'))
      .toMatchInlineSnapshot(`
      [
        {
          "arguments": [
            {
              "name": "text",
              "required": false,
              "type": "string",
            },
          ],
          "default": true,
          "name": "hello",
        },
      ]
    `);

    expect(getExportFunction(fns.join('\n'))).toMatchInlineSnapshot(`
      [
        {
          "arguments": [
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
          "default": false,
          "name": "hello",
        },
        {
          "arguments": [
            {
              "name": "text",
              "required": true,
              "type": "string",
            },
          ],
          "default": true,
          "name": "",
        },
      ]
    `);
  });
}
