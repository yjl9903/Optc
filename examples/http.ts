#!/usr/bin/env optc

/// <reference path="../packages/optc/globals.d.ts" />

export async function get(url: string) {
  const { data } = await http.get(url);
  console.log(data);
}
