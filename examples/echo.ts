#!/usr/bin/env optc

export const name = 'echo';

export const version = '0.0.0';

export default function (text: string) {
  console.log(text);
  return text;
}

export function greet(name?: string) {
  const text = `Hello, ${name ?? 'Stranger'}`;
  console.log(text);
  return text;
}
