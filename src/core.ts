import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { CAC, cac } from 'cac';

// @ts-ignore
import BabelTsPlugin from '@babel/plugin-transform-typescript';

import { logWarn } from './utils';
import { OPTC_ROOT } from './space';
import { registerGlobal } from './globals';
import { reflect, ReflectionPlugin, ValueType } from './reflect';

export async function bootstrap<T = any>(script: string, ...args: string[]): Promise<T> {
  const scriptName = path.parse(path.basename(script)).name;

  const jiti = (await import('jiti')).default(import.meta.url, {
    cache: true,
    sourceMaps: false,
    transformOptions: {
      babel: {
        plugins: [
          [ReflectionPlugin, {}],
          [BabelTsPlugin, {}]
        ]
      }
    }
  });

  {
    const cacheDir = path.join(OPTC_ROOT, '.cache');
    await fs.ensureDir(cacheDir);

    const content = await fs.readFile(script);
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    // This is a hack.
    // First, jiti will auto infer whether enable babel TS plugin.
    // Second, custom plugin will always go after TS plugin.
    // So, I can not get TS infomation for generation.
    // Finally, add this `.js` ext will disable babel TS plugin.
    script = path.join(cacheDir, scriptName + '_' + hash + '.js');

    if (!fs.existsSync(script)) {
      await fs.writeFile(script, content);
    }
  }

  const module = await jiti(path.resolve(process.cwd(), script));

  const cli = new Optc(scriptName, script, module);
  return await cli.run<T>(args);
}

class Optc {
  private readonly scriptPath: string;

  private readonly rawModule: Record<string, any>;

  private readonly cac: CAC;

  constructor(name: string, script: string, rawModule: Record<string, any>) {
    this.scriptPath = script;
    this.rawModule = rawModule;

    const loadField = (field: string, defaultValue: string) => {
      const value = this.rawModule[field];
      if (value === undefined || value === null) return defaultValue;
      if (typeof value === 'string') return value;
      if (typeof value === 'function') return value();
      return defaultValue;
    };

    this.cac = cac(loadField('name', name));
    this.cac.version(loadField('version', 'unknown'));
    this.cac.help();
    this.initCommands();
  }

  private initCommands() {
    const commands = reflect(this.scriptPath);
    for (const command of commands) {
      const name = [
        command.name,
        ...command.arguments.map((arg) =>
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

  async run<T = any>(args: string[]): Promise<T> {
    await registerGlobal();
    this.cac.parse(['node', this.scriptPath, ...args], { run: false });
    return await this.cac.runMatchedCommand();
  }
}
