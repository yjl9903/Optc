# Optc

[![version](https://img.shields.io/npm/v/optc?color=rgb%2850%2C203%2C86%29&label=Optc)](https://www.npmjs.com/package/optc) [![CI](https://github.com/yjl9903/Optc/actions/workflows/ci.yml/badge.svg)](https://github.com/yjl9903/Optc/actions/workflows/ci.yml)

An easy way to write a single-file TypeScript command line application.

## Features

+ Based on TypeScript
+ Automatically register sub commands
+ Automatically call the corresponding method and pass arguments
+ Generate help message

## Installation

```bash
npm i -g optc
```

## Usage

See example [echo.ts](./examples/echo.ts).

```ts
#!/usr/bin/env optc

export const name = 'echo';

export const version = '0.0.0';

export default function(text: string) {
  console.log(text);
}

export function greet(name?: string) {
  console.log(`Hello, ${ name ?? 'Stranger' }`);
}
```

Optc will automatically generate a default command with a required paramter `text` and a subcommand `greet` with an optional paramter `name`.

```bash
optc examples/echo.ts word
# word

optc examples/echo.ts greet world
# Hello, world

optc examples/echo.ts --version
# echo/0.0.0 win32-x64 node-v16.14.2

optc examples/echo.ts --help
# echo/0.0.0
# 
# Usage:
#   $ echo <text>
# 
# Commands:
#   <text>        
#   greet [name]  
# 
# For more info, run any command with the `--help` flag:
#   $ echo --help
#   $ echo greet --help
# 
# Options:
#   -v, --version  Display version number 
#   -h, --help     Display this message

# or use it directly
./examples/echo.ts greet Optc
# Hello, Optc
```

You can see more examples in the [./examples](./examples).

### Functions

Optc has some builtin functions based on some famous libs.

+ `cd(dir: string)`: Change directory
+ `pwd()`: Print working directory
+ `` $`cmd` ``: Exec command like [zx](https://github.com/google/zx)
+ `path`: [Node.js Path API](https://nodejs.org/api/path.html)
+ `fs`: [fs-extra](https://www.npmjs.com/package/fs-extra)
+ `glob`: [globby](https://www.npmjs.com/package/globby)
+ `http`: [axios](https://www.npmjs.com/package/axios)

### Limitation

+ Optc extracts type infomation with [regular expressions](https://github.com/yjl9903/Optc/blob/66fd572fc1e7fede1e341d44e7b39fdaf1a45dab/src/reflect/index.ts#L43-L75), so you **can not** do some type magic (union type, generic type and so on) on the types of paramters.

+ Global code snippets can not have the type of global functions. Currently, it links to the local type declaration file.

## Inspiration

+ [argc](https://github.com/sigoden/argc): A handy way to handle sh/bash cli parameters.
+ [zx](https://github.com/google/zx): A tool for writing better scripts
+ [cac](https://github.com/cacjs/cac): Simple yet powerful framework for building command-line apps.

## License

MIT License © 2021 [XLor](https://github.com/yjl9903)
