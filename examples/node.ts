#!/usr/bin/env optc

/// <reference type="../globals">

export default async function () {
  const { stdout } = await $`node --version`;
  console.log(`Version: ${stdout}`);
}
