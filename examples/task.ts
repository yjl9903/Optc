#!/usr/bin/env optc

/// <reference type="../globals">

export default async function (name: string) {
  await $`echo "Run task:" ${name}`;
  await $`pnpm run ${name}`;
}
