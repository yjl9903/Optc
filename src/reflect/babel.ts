import type { PluginObj } from '@babel/core';

import createDebug from 'debug';

const debug = createDebug('optc:reflection');

export function ReflectionPlugin(): PluginObj {
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
