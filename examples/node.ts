#!/usr/bin/env optc

/// <reference types="../globals" />

export default async function () {
  const { stdout } = await $`node --version`;
  console.log(`Version: ${stdout}`);
}
