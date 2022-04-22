import { writeFileSync } from 'fs';
import { lightRed } from 'kolorist';
import { debug as createDebug } from 'debug';

import { version } from '../package.json';

import { bootstrap } from './core';

const name = 'optc';

const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;

const debug = createDebug(name + ':cli');

async function main(args: string[]) {
  if (args.length === 0) {
    console.error(lightRed('Error ') + 'You must provide <script>');
    process.exit(1);
  }

  const first = args[0];
  if (first === '-v' || first === '--version') {
    console.log(`${name}/${version} ${platformInfo}`);
    return;
  } else if (first === '-h' || first === '--help') {
    console.log(`${name}/${version}`);
    console.log();
    console.log('Usage:');
    console.log('  $ optc <script> [...args]');
    console.log();
    console.log('Commands:');
    console.log('  new <script>  Create a new empty script');
    console.log();
    console.log('Options:');
    console.log('  -v, --version           Display version number');
    console.log('  -h, --help              Display this message');
    return;
  } else if (first === 'new') {
    const filename = args[1];
    if (filename) {
      const template = ['#!/usr/bin/env optc', '', '/// <reference types="optc/global" />', '', ''];
      const name = filename.endsWith('.ts') ? filename : filename + '.ts';
      writeFileSync(name, template.join('\n'), 'utf-8');
    }
    return;
  }

  const handle = (error: unknown) => {
    if (error instanceof Error) {
      console.error(lightRed('Error ') + error.message);
    } else {
      console.error(error);
    }
    debug(error);
  };

  process.on('unhandledRejection', (error) => {
    handle(error);
  });

  try {
    bootstrap(args[0], ...args.slice(1));
  } catch (error: unknown) {
    handle(error);
    process.exit(1);
  }
}

main(process.argv.slice(2));
