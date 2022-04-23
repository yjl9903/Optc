#!/usr/bin/env optc

import '../globals';

export default async function () {
  const { stdout } = await $`node --version`;
  console.log(`Version: ${stdout}`);
}
