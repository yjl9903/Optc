import type { PluginObj } from '@babel/core';

import createDebug from 'debug';

import type { Command } from './types';

const debug = createDebug('optc:reflection');

export function ReflectionPlugin(_ctx: any, option: { commands: Command[] }): PluginObj {
  debug('Create plugin');
  return {
    name: 'optc-reflection',
    visitor: {
      Program(path) {
        debug('This is a program');
      },
      FunctionDeclaration(path) {
        debug('Declare a function');
      },
      TSInterfaceDeclaration() {
        debug('Declare a interface');
      }
    }
  };
}
