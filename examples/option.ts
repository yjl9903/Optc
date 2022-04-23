#!/usr/bin/env optc

/// <reference type="../globals">

interface Option {
  root?: string;

  file: string;
}

export default async function (option: Option) {
  const root = option?.root ?? process.cwd();
  console.log(`Root: ${root}`);
  console.log(await readJson(path.join(root, 'package.json')));
}
