import path from 'node:path';
import { defineBuildConfig } from 'unbuild';

// import { MagicRegExpTransformPlugin } from 'magic-regexp/transform';

export default defineBuildConfig({
  entries: ['src/cli', 'src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true
  },
  replace: {
    'import.meta.vitest': 'undefined'
  },
  externals: [path.join(__dirname, './package.json')],
  hooks: {
    'rollup:options': (_options, config) => {
      // config.plugins!.push(MagicRegExpTransformPlugin.rollup());
    }
  }
});
