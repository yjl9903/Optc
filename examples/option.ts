#!/usr/bin/env optc

/// <reference type="../globals">

interface Option {
  root?: string;

  file: string;
}

export default async function (option: Option) {
  console.log(`Root: ${option?.root}`);
}
