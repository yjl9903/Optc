#!/usr/bin/env optc

/// <reference type="../globals">

interface Option {
  root?: string;

  file: string;
}

export default async function (option: Option) {
  const root = option?.root ?? process.cwd();
  console.log(`Root: ${root}`);
  const pkgs = await glob(['**/package.json', '!node_modules']);
  for (const name of pkgs) {
    const pkg = await readJson(name);
    console.log(`${pkg.name}: ${pkg.version}`);
  }
}
