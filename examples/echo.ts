#!/usr/bin/env optc

export const name = 'echo';

export const version = '0.0.0';

export default function(text: string) {
  console.log(text);
}

export function greet(name?: string) {
  console.log(`Hello, ${ name ?? 'Stranger' }`);
}
