import type { PluginObj } from '@babel/core';
import type {
  Comment,
  TSArrayType,
  TSTypeElement,
  TSTypeAnnotation,
  TSPropertySignature
} from '@babel/types';

import createDebug from 'debug';

import { logWarn } from '../utils';

import { Command, Parameter, Option, ValueType } from './types';

const debug = createDebug('optc:reflection');

export function ReflectionPlugin(_ctx: any, option: { commands: Command[] }): PluginObj {
  debug('Create Reflection Plugin');

  const optionMap = new Map<string, Option[]>();

  return {
    name: 'optc-reflection',
    pre() {
      optionMap.clear();
    },
    visitor: {
      ExportDeclaration(exportPath) {
        const isDefault = exportPath.node.type === 'ExportDefaultDeclaration';

        exportPath.traverse({
          FunctionDeclaration(path) {
            debug(isDefault ? 'Export a default function' : 'Export a function');

            const options: Array<Option> = [];
            const parameters: Array<Parameter | undefined> = path.node.params.map((param, pidx) => {
              if (param.type === 'Identifier') {
                let type =
                  param.typeAnnotation?.type === 'TSTypeAnnotation'
                    ? parseType(param.typeAnnotation)
                    : undefined;

                if (type && type === ValueType.Boolean) {
                  type = ValueType.String;
                  logWarn(
                    `Unsupport parameter type annotation at function ${
                      path.node.id?.name ?? 'default'
                    }`
                  );
                }

                if (!type && pidx + 1 === path.node.params.length) {
                  // Try parse option
                  if (param.typeAnnotation?.type === 'TSTypeAnnotation') {
                    if (param.typeAnnotation.typeAnnotation.type === 'TSTypeReference') {
                      // Try parse interface option
                      if (param.typeAnnotation.typeAnnotation.typeName.type === 'Identifier') {
                        const name = param.typeAnnotation.typeAnnotation.typeName.name;
                        if (optionMap.has(name)) {
                          options.push(...optionMap.get(name)!);
                        } else {
                          optionMap.set(name, options);
                        }
                      }
                    } else if (param.typeAnnotation.typeAnnotation.type === 'TSTypeLiteral') {
                      // Try parse inline options
                      options.push(...parseOptions(param.typeAnnotation.typeAnnotation.members));
                    }
                  }
                  return undefined;
                } else if (!type) {
                  logWarn(
                    `Unsupport parameter type annotation at function ${
                      path.node.id?.name ?? 'default'
                    }`
                  );
                }

                return {
                  name: param.name,
                  type: type ?? ValueType.String,
                  required: !param.optional
                };
              } else if (param.type === 'ObjectPattern') {
                // Pattern matching option
              } else {
                // Unsupport
                return undefined;
              }
            });

            const command: Command = {
              name: path.node.id?.name ?? '',
              default: isDefault,
              options,
              parameters: parameters.filter(Boolean) as Parameter[],
              description: parseComment(exportPath.node.leadingComments)
            };
            option.commands.push(command);

            // Stop inner visit
            path.stop();
          }
        });
      },
      TSInterfaceDeclaration(path) {
        debug('Declare Interface');

        const options = parseOptions(path.node.body.body);
        if (optionMap.has(path.node.id.name)) {
          optionMap.get(path.node.id.name)!.push(...options);
        } else {
          optionMap.set(path.node.id.name, options);
        }
      }
    }
  };
}

function parseComment(comments: Comment[] | undefined | null): string {
  if (!Array.isArray(comments)) return '';

  // filter three slash command
  comments = comments.filter((c) => !(c.type === 'CommentLine') || !c.value.startsWith('/'));
  if (comments.length === 0) return '';

  if (comments[comments.length - 1].type === 'CommentLine') {
    return comments[comments.length - 1].value.trim();
  } else {
    const text = comments[comments.length - 1].value;
    // deal with "/** */" comment block and "/* */" comment block
    if (text.startsWith('*\n')) {
      const lines = text
        .split('\n')
        .map((t) => t.trim())
        .map((t) => (t.startsWith('*') ? t.slice(1) : t))
        .map((t) => t.trim())
        .filter(Boolean);
      return lines.length > 0 ? lines[0] : '';
    } else {
      return text.trim();
    }
  }
}

function parseType(typeAnnotation: TSTypeAnnotation | undefined | null): ValueType | undefined {
  if (!typeAnnotation) return ValueType.String;

  const type = typeAnnotation.typeAnnotation.type;
  if (type === 'TSStringKeyword') {
    return ValueType.String;
  } else if (type === 'TSNumberKeyword') {
    return ValueType.Number;
  } else if (type === 'TSBooleanKeyword') {
    return ValueType.Boolean;
  } else if (type === 'TSArrayType') {
    const elType = (typeAnnotation.typeAnnotation as TSArrayType).elementType.type;
    if (elType === 'TSStringKeyword') {
      return ValueType.Array;
    } else {
      // Unsupport array
      return undefined;
    }
  } else {
    return undefined;
  }
}

function parseOptions(body: TSTypeElement[]): Option[] {
  const sigs = body.filter((t) => t.type === 'TSPropertySignature') as TSPropertySignature[];
  return sigs
    .map((sig) => {
      if (sig.key.type === 'Identifier') {
        let type = parseType(sig.typeAnnotation);
        if (!type) {
          // Unsupport here
        }
        return {
          name: sig.key.name,
          type: type ?? ValueType.String,
          required: !sig.optional,
          description: parseComment(sig.leadingComments)
        };
      } else {
        return undefined;
      }
    })
    .filter(Boolean) as Option[];
}
