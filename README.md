# Optc

[![version](https://img.shields.io/npm/v/optc?color=rgb%2850%2C203%2C86%29&label=Optc)](https://www.npmjs.com/package/optc) [![CI](https://github.com/yjl9903/Optc/actions/workflows/ci.yml/badge.svg)](https://github.com/yjl9903/Optc/actions/workflows/ci.yml)

An easy way to write TypeScript cli script application.

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

optc examples/echo.ts --version
# echo/0.0.0 win32-x64 node-v16.14.2

# or use it directly
./examples/echo.ts greet Optc
# Hello, Optc
```

### Limitation

Optc extracts type infomation with regular expressions, so you **can not** do some type magic (union type, generic type and so on) on the types of paramters.

## Inspiration

+ [argc](https://github.com/sigoden/argc): A handy way to handle sh/bash cli parameters.
+ [zx](https://github.com/google/zx): A tool for writing better scripts
+ [cac](https://github.com/cacjs/cac): Simple yet powerful framework for building command-line apps.

## License

MIT License © 2021 [XLor](https://github.com/yjl9903)
