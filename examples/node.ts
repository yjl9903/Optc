#!/usr/bin/env optc

/// <reference path="../packages/optc/globals.d.ts" />

export default async function () {
  const { stdout } = await $`node --version`;
  console.log(`Version: ${stdout}`);
}
