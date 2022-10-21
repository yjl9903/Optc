#!/usr/bin/env optc

/// <reference path="../space/globals.d.ts" />

export async function hello() {
  return await $`${['echo', 'hello']}`;
}
