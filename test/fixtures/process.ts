#!/usr/bin/env optc

/// <reference path="../../globals.d.ts" />

export async function hello() {
  return await $`${['echo', 'hello']}`;
}
