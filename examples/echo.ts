#!/usr/bin/env optc

export const name = 'echo';

export const version = '0.0.0';

// Echo some message
export default function (text: string) {
  console.log(text);
  return text;
}

// Greet someone
export function greet(name?: string, option?: { prefix: string }) {
  const text = `${option?.prefix || 'Hello'}, ${name ?? 'Stranger'}`;
  console.log(text);
  return text;
}
