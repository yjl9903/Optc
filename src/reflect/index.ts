import { readFileSync } from 'fs';

import { logWarn } from '../utils';

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

export interface Option {
  name: string;
  type: ValueType;
  required: boolean;
  description: string;
}

export interface Command {
  name: string;
  default: boolean;
  options: Option[];
  arguments: Argument[];
  description: string;
}

const exportDefaultFunctionRE =
  /\bexport\s+default(?:\s+async)?\s+function(\s*[a-zA-Z0-9_\-]*)\s*\(([^)]*)\)/g;
const exportFunctionRE = /\bexport(?:\s+async)?\s+function\s+([a-zA-Z0-9_\-]+)\s*\(([^)]*)\)/g;

export function reflect(script: string) {
  const content = readFileSync(script, 'utf-8');
  return getExportFunction(content);
}

function getExportFunction(content: string): Command[] {
  const transform = (match: RegExpExecArray): Command => {
    const func = match[1].trim();

    const options: Option[] = [];

    const getOption = (name: string) => {
      const optionRE = new RegExp(`interface\\s+${name}\\s*{([^}]*)}`);
      const match = optionRE.exec(content);
      if (match) {
        const body = match[1];
        for (const field of matchAll(body, /([a-zA-Z0-9_]+)\s*(\??):\s*(string|number|boolean)/g)) {
          if (isValueType(field[3])) {
            options.push({
              name: field[1],
              required: field[2] === '',
              type: field[3] as ValueType,
              description: ''
            });
          }
        }
      } else {
        logWarn(`Can not find option interface of Function ${func}`);
      }
    };

    const arg = match[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s, i, arr) => {
        if (s.includes(':')) {
          const pos = s.indexOf(':');

          if (pos === 0) {
            logWarn(`unknown (Parameter: ${s})`);
            return undefined;
          }
          const required = s[pos - 1] !== '?';

          const name = s.slice(0, pos - (required ? 0 : 1)).trim();
          const type = s.slice(pos + 1).trim();

          if (!isValueType(type)) {
            if (i === arr.length - 1) {
              getOption(type);
            } else {
              logWarn(
                `Type ${type} is not number, boolean or string in ${name} of Function ${func}`
              );
            }
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

    return {
      name: func,
      arguments: arg,
      options,
      default: false,
      description: ''
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
          "description": "",
          "name": "hello",
          "options": [],
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
          "description": "",
          "name": "",
          "options": [],
        },
      ]
    `);

    expect(
      getExportFunction('export default function hello(text?: string) {}')
    ).toMatchInlineSnapshot('[]');

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
          "description": "",
          "name": "hello",
          "options": [],
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
          "description": "",
          "name": "",
          "options": [],
        },
      ]
    `);

    expect(getExportFunction('export default async function() {}')).toMatchInlineSnapshot('[]');

    expect(getExportFunction('export  async  function hello () {}')).toMatchInlineSnapshot(`
      [
        {
          "arguments": [],
          "default": false,
          "description": "",
          "name": "hello",
          "options": [],
        },
      ]
    `);
  });

  it('parse option', () => {
    const inter = `interface Option { root: string; port?: number; open: boolean; }`;
    const fn = `export default function (option: Option) {}`;
    expect(getExportFunction(inter + fn)).toMatchInlineSnapshot(`
      [
        {
          "arguments": [],
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
        },
      ]
    `);
  });
}
