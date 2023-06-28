#!/usr/bin/env optc

/// <reference path="../packages/optc/globals.d.ts" />

export const description = 'Send HTTP request'

/**
 * Send a HTTP GET request to the url
 */
export default async function get(url: string) {
  const { data } = await http.get(url);
  console.log(data);
}
