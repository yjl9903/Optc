# Optc

[![version](https://img.shields.io/npm/v/optc?color=rgb%2850%2C203%2C86%29&label=Optc)](https://www.npmjs.com/package/optc) [![install size](https://packagephobia.com/badge?p=optc)](https://packagephobia.com/result?p=optc) [![CI](https://github.com/yjl9903/Optc/actions/workflows/ci.yml/badge.svg)](https://github.com/yjl9903/Optc/actions/workflows/ci.yml)

An easy way to write a single-file TypeScript command line application.

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

// Echo some message
export default function (text: string) {
  console.log(text);
  return text;
}

// Greet someone
export function greet(name?: string, option?: { prefix: string }) {
  const text = `${option?.prefix ?? 'Hello'}, ${name ?? 'Stranger'}`;
  console.log(text);
  return text;
}
```

When running the above CLI script, Optc will automatically generate a default command with a required paramter `text`, and a subcommand `greet` with an optional paramter `name`.

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
#   <text>        Echo some message
#   greet [name]  Greet someone
#
# For more info, run any command with the `--help` flag:
#   $ echo --help
#   $ echo greet --help
#
# Options:
#   -v, --version  Display version number
#   -h, --help     Display this message

# or use it directly, make sure you grant the executable permissions
./examples/echo.ts greet Optc --prefix Hi
# Hi, Optc
```

You can see more examples in the [./examples](./examples).

### Libraries

Optc has some builtin functions based on some famous libs.

+ `cd(dir: string)`: Change directory
+ `pwd()`: Print working directory
+ `` $`cmd` ``: Exec command like [zx](https://github.com/google/zx)
+ `path`: [Node.js Path API](https://nodejs.org/api/path.html)
+ `fs`: [fs-extra](https://www.npmjs.com/package/fs-extra)
+ `glob`: [globby](https://www.npmjs.com/package/globby)
+ `http`: [axios](https://www.npmjs.com/package/axios)

### Custom Libraries

You can init a node module at `~/.optc/`, and create `~/.optc/dep.ts` to import all your custom libraries, functions and so on to your script execution environment.

```ts
// ~/.optc/dep.ts

// Make sure that you have install "kolorist" in `~/.optc/`
import kolorist from 'kolorist'

export default function(global: any) {
  global.color = kolorist
}
```

### Limitation

+ Optc extracts type infomation from the abstract syntax tree of the code (based on [babel](https://babeljs.io/)), so you **can not** do some type magic (union type, generic type and so on) on the types of paramters.

+ Global code snippets can not have the type of global functions. Currently, it links to the local type declaration file.

## Inspiration

+ [argc](https://github.com/sigoden/argc): A handy way to handle sh/bash cli parameters.
+ [zx](https://github.com/google/zx): A tool for writing better scripts
+ [cac](https://github.com/cacjs/cac): Simple yet powerful framework for building command-line apps.

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
