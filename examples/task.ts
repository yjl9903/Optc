#!/usr/bin/env optc

/// <reference path="../globals.d.ts" />

export default async function (names: string[]) {
  for (const name of names) {
    await $`echo "Run task:" ${name}`;
    await $`pnpm run ${name}`;
  }
}
