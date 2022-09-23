#!/usr/bin/env optc

/// <reference type="../globals">

export async function get(url: string) {
  const { data } = await http.get(url);
  console.log(data);
}
