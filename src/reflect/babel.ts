import type { PluginObj } from '@babel/core';
import type { Comment, TSArrayType, TSTypeAnnotation, TypeAnnotation } from '@babel/types';

import createDebug from 'debug';

import { logWarn } from '../utils';

import { Command, Parameter, ValueType } from './types';

const debug = createDebug('optc:reflection');

export function ReflectionPlugin(_ctx: any, option: { commands: Command[] }): PluginObj {
  debug('Create Reflection Plugin');

  return {
    name: 'optc-reflection',
    visitor: {
      ExportDeclaration(exportPath) {
        const isDefault = exportPath.node.type === 'ExportDefaultDeclaration';

        exportPath.traverse({
          FunctionDeclaration(path) {
            debug(isDefault ? 'Export a default function' : 'Export a function');

            const parameters: Array<Parameter | undefined> = path.node.params.map((param, pidx) => {
              debug(param);
              if (param.type === 'Identifier') {
                const type1 =
                  param.typeAnnotation?.type === 'TSTypeAnnotation'
                    ? parseType(param.typeAnnotation)
                    : undefined;

                if (type1 && type1 === ValueType.Boolean) {
                  // TODO: log unsupport
                }
                if (!type1 && pidx + 1 === path.node.params.length) {
                  // Try parse option
                  if (param.typeAnnotation?.type === 'TSTypeAnnotation') {
                    if (param.typeAnnotation.typeAnnotation.type === 'TSTypeReference') {
                      // Try parse interface option
                    } else if (param.typeAnnotation.typeAnnotation.type === 'TSTypeLiteral') {
                      // Try parse inline options
                      debug(param.typeAnnotation.typeAnnotation);
                    }
                  }
                  return undefined;
                } else {
                  logWarn(
                    `Unsupport type annotation at function ${path.node.id?.name ?? 'default'}`
                  );
                }

                return {
                  name: param.name,
                  type: type1 ?? ValueType.String,
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
              options: [],
              parameters: parameters.filter(Boolean) as Parameter[],
              description: parseComment(exportPath.node.leadingComments)
            };
            debug(command);
            option.commands.push(command);

            // Stop inner visit
            path.stop();
          }
        });
      }
    }
  };
}

function parseComment(comments: Comment[] | undefined | null) {
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

function parseType(typeAnnotation: TSTypeAnnotation | undefined | null) {
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
      return undefined;
    }
  } else {
    return undefined;
  }
}
