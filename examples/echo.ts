#!/usr/bin/env optc

export const name = 'echo';

export const version = '0.0.0';

export const description = 'Print some messages';

// Echo some message
export default function echo(text: string) {
  console.log(text);
  return text;
}

// Greet someone
export function greet(name?: string, option?: { prefix: string }) {
  const text = `${option?.prefix ?? 'Hello'}, ${name ?? 'Stranger'}`;
  console.log(text);
  return text;
}
