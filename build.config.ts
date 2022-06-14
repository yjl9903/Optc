import path from 'path';
import { defineBuildConfig } from 'unbuild';

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
  externals: [path.join(__dirname, './package.json')]
});
