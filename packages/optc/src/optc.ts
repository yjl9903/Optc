import { Breadc, breadc } from 'breadc';

import { logWarn } from './utils';
import { registerGlobal } from './globals';
import { Command, ValueType } from './reflect';

export class Optc {
  private readonly scriptPath: string;

  private readonly breadc: Breadc;

  private commands: Command[] = [];

  constructor(scriptPath: string, option: { name: string; version: string; description?: string }) {
    this.scriptPath = scriptPath;
    this.breadc = breadc(option.name, { version: option.version, description: option.description });
  }

  public getRawCommands() {
    return this.commands;
  }

  public setupCommands(module: Record<string, any>, commands: Command[]) {
    this.commands.push(...commands);

    for (const command of commands) {
      const name = [
        command.name,
        ...command.parameters.map((arg) =>
          arg.type === ValueType.Array
            ? `[...${arg.name}]`
            : arg.required
            ? `<${arg.name}>`
            : `[${arg.name}]`
        )
      ];
      if (command.default) {
        name.splice(0, 1);
      }

      const fn = command.default ? module.default : module[command.name];
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
              text += ' <text>';
            }
          } else if (option.type === ValueType.Array) {
            text += ' [...text]';
          }
          return cmd.option(text, option.description);
        }, this.breadc.command(name.join(' '), command.description))
        .action(fn);
    }
  }

  async run<T = any>(args: string[]): Promise<T> {
    await registerGlobal();
    return this.breadc.run(args);
  }
}
