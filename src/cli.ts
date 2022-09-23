import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import createDebug from 'debug';
import { lightRed } from 'kolorist';

import { version } from '../package.json';

import { Process } from './globals/process';
import { bootstrap } from './core';
import { OPTC_ROOT } from './constant';

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
    printHelp();
    return;
  } else if (first === 'new') {
    const filename = args[1];
    if (filename) {
      createNewScript(filename);
    }
    return;
  } else if (first === 'space') {
    fs.ensureDirSync(OPTC_ROOT);
    console.log(OPTC_ROOT);
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
    await bootstrap(args[0], ...args.slice(1));
  } catch (error: unknown) {
    handle(error);
    process.exit(1);
  }
}

function printHelp() {
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
}

async function createNewScript(_filename: string) {
  const filename = _filename.endsWith('.ts') ? _filename : _filename + '.ts';
  if (!fs.existsSync(filename)) {
    const globalsDts = path.join(fileURLToPath(import.meta.url), '../../globals.d.ts');
    const pkg = fs.existsSync('package.json') ? fs.readJSONSync('package.json') : undefined;
    const isLocal = !!pkg?.dependencies?.optc || !!pkg?.devDependencies?.optc;
    const template = [
      '#!/usr/bin/env optc',
      '',
      isLocal ? `/// <reference types="optc/globals" />` : `/// <reference path="${globalsDts}" />`,
      '',
      'export default async function() {',
      '  ',
      '}',
      ''
    ];
    fs.writeFileSync(filename, template.join('\n'), 'utf-8');
  } else {
    console.error(lightRed('Error ') + `${filename} exists`);
  }

  const editor = process.env.EDITOR;
  if (editor === 'code') {
    const cmd = `${editor} --goto ${filename}:6:3`;
    await Process([cmd], [], { verbose: false });
  } else if (editor) {
    const cmd = `${editor} ${filename}`;
    await Process([cmd], [], { verbose: false });
  }
}

main(process.argv.slice(2));
