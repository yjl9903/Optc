import { readFileSync } from 'node:fs';
import {
  createRegExp,
  MagicRegExpMatchArray,
  exactly,
  oneOrMore,
  whitespace,
  word,
  charNotIn,
  global,
  multiline
} from 'magic-regexp';

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

const exportDefaultFunctionRE = createRegExp(
  exactly('export')
    .and(oneOrMore(whitespace))
    .and(exactly('default'))
    .and(oneOrMore(whitespace))
    .and(exactly('async').and(oneOrMore(whitespace)).optionally())
    .and(exactly('function'))
    .and(oneOrMore(whitespace).and(oneOrMore(word)).optionally().as('name'))
    .and(whitespace.times.any())
    .and(exactly('('))
    .and(charNotIn(')').times.any().as('parameters'))
    .and(exactly(')'))
    .at.lineStart(),
  [multiline]
);

const exportFunctionRE = createRegExp(
  exactly('export')
    .and(oneOrMore(whitespace))
    .and(exactly('async').and(oneOrMore(whitespace)).optionally())
    .and(exactly('function'))
    .and(oneOrMore(whitespace))
    .and(oneOrMore(word).as('name'))
    .and(whitespace.times.any())
    .and(exactly('('))
    .and(charNotIn(')').times.any().as('parameters'))
    .and(exactly(')'))
    .at.lineStart(),
  [global, multiline]
);

export function reflect(script: string) {
  const content = readFileSync(script, 'utf-8');
  const commands = getExportFunction(content);
  commands.sort((lhs, rhs) => {
    if (lhs.default) return -1;
    if (rhs.default) return 1;
    return lhs.name.localeCompare(rhs.name);
  });
  return commands;
}

function getExportFunction(content: string): Command[] {
  const transform = (match: MagicRegExpMatchArray<typeof exportDefaultFunctionRE>): Command => {
    const func = (match.groups.name ?? '').trim();

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

    const arg = (match.groups.parameters ?? '')
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

  const commands = [...content.matchAll(exportFunctionRE)].map(transform);
  const defaultCommand = content.match(exportDefaultFunctionRE);
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

  it('should accept by RE', () => {
    expect(exportDefaultFunctionRE.test('export default function() {}')).toBeTruthy();
    expect(exportDefaultFunctionRE.test('export default function () {}')).toBeTruthy();
    expect(exportDefaultFunctionRE.test('export default function  () {}')).toBeTruthy();
    expect(exportDefaultFunctionRE.test('export default function   () {}')).toBeTruthy();
  });

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
          "description": "",
          "name": "hello",
          "options": [],
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

    expect(getExportFunction('export default async function() {}')).toMatchInlineSnapshot(`
      [
        {
          "arguments": [],
          "default": true,
          "description": "",
          "name": "",
          "options": [],
        },
      ]
    `);

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
    expect(getExportFunction(inter + '\n' + fn)).toMatchInlineSnapshot(`
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
