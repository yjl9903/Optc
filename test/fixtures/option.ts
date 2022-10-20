#!/usr/bin/env optc

/**
 * This is a default command
 */
export default async function (option: Option) {
  function hello() {}
  hello();
}

interface Option {
  // This is root
  root: string;
}

// Say hello
export function hello(msg: string[], option: { recv: string }) {}
