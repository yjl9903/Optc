import cac from 'cac';
import { lightRed } from 'kolorist';
import { debug as createDebug } from 'debug';

import { version } from '../package.json';

import { CliOption } from './types';

const name = 'opts';

const debug = createDebug(name + ':cli');

const cli = cac(name);

cli.command('').action(async (_option: CliOption) => {
  console.log('Hello world');
});

cli.help();

cli.version(version);

async function bootstrap() {
  const handle = (error: unknown) => {
    if (error instanceof Error) {
      console.error(lightRed('Error: ') + error.message);
    } else {
      console.error(error);
    }
    debug(error);
  };

  process.on('unhandledRejection', (error) => {
    handle(error);
  });

  try {
    cli.parse(process.argv, { run: false });
    await cli.runMatchedCommand();
  } catch (error: unknown) {
    handle(error);
    process.exit(1);
  }
}

bootstrap();
