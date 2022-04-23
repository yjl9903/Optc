import path from 'path';
import { CAC, cac } from 'cac';

import { logWarn } from './utils';
import { registerGlobal } from './globals';
import { reflect, ValueType } from './reflect';

export async function bootstrap(script: string, ...args: string[]) {
  const jiti = (await import('jiti')).default(__filename, { cache: true, sourceMaps: false });
  const module = await jiti(path.resolve(process.cwd(), script));

  const cli = new Optc(script, module);
  registerGlobal();
  await cli.run(args);
}

class Optc {
  private readonly scriptPath: string;

  private readonly rawModule: Record<string, any>;

  private readonly cac: CAC;

  constructor(script: string, rawModule: Record<string, any>) {
    this.scriptPath = script;
    this.rawModule = rawModule;

    const loadField = (field: string, defaultValue: string) => {
      const value = this.rawModule[field];
      if (value === undefined || value === null) return defaultValue;
      if (typeof value === 'string') return value;
      if (typeof value === 'function') return value();
      return defaultValue;
    };

    this.cac = cac(loadField('name', path.basename(script).replace(/\.[\s\S]+$/, '')));
    this.cac.version(loadField('version', 'unknown'));
    this.cac.help();
    this.initCommands();
  }

  private initCommands() {
    const commands = reflect(this.scriptPath);
    for (const command of commands) {
      const name = [
        command.name,
        ...command.arguments.map((arg) => (arg.required ? `<${arg.name}>` : `[${arg.name}]`))
      ];
      if (command.default) {
        name.splice(0, 1);
      }

      const fn = command.default ? this.rawModule.default : this.rawModule[command.name];
      if (!fn || typeof fn !== 'function') {
        if (command.default) {
          logWarn(`Can not find default function`);
        } else {
          logWarn(`Can not find function ${command.name}`);
        }
      }

      command.options
        .reduce((cmd, option) => {
          let text = `--${option.name}`;
          if (option.type === ValueType.String || option.type === ValueType.Number) {
            if (option.required) {
              text += ' <text>';
            } else {
              text += ' [text]';
            }
          } else if (option.type === ValueType.Array) {
            text += ' [...text]';
          }
          return cmd.option(text, option.description);
        }, this.cac.command(name.join(' '), command.description))
        .action(fn);
    }
  }

  async run(args: string[]) {
    this.cac.parse(['node', this.scriptPath, ...args], { run: false });
    await this.cac.runMatchedCommand();
  }
}
