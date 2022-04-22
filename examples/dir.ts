#!/usr/bin/env optc

/// <reference types="../global" />

export default function () {
  cd('examples');
  console.log('Current:', pwd());
}
