import fs from 'fs-extra';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

import { CAC, cac } from 'cac';

// @ts-ignore
import BabelTsPlugin from '@babel/plugin-transform-typescript';

import { version as OptcVersion } from '../package.json';

import { OPTC_CACHE, CACHE_ROOT } from './space';
import { registerGlobal } from './globals';
import { importJiti, logWarn } from './utils';
import { Command, ReflectionPlugin, ValueType } from './reflect';

export async function makeOptc(script: string): Promise<Optc> {
  await fs.ensureDir(CACHE_ROOT);

  const scriptName = path.parse(path.basename(script)).name;
  const content = await fs.readFile(script);
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  // This is a hack.
  // First, jiti will auto infer whether enable babel TS plugin.
  // Second, custom plugin will always go after TS plugin.
  // So, I can not get TS infomation for generation.
  // Finally, add this `.js` ext will disable babel TS plugin.
  const cachedScriptPath = path.join(CACHE_ROOT, scriptName + '_' + hash + '.js');
  const cachedReflPath = path.join(CACHE_ROOT, scriptName + '_' + hash + '.json');

  const initOptc = async (): Promise<Optc> => {
    const commands: Command[] = [];
    const jiti = (await importJiti())(pathToFileURL(script).href, {
      cache: OPTC_CACHE,
      sourceMaps: false,
      transformOptions: {
        babel: {
          plugins: [
            [ReflectionPlugin, { commands }],
            [BabelTsPlugin, {}]
          ]
        }
      }
    });

    interface CachedReflection {
      name: string;
      version: string;
      commands: Command[];
      optc: {
        version: string;
      };
    }

    if (!OPTC_CACHE || !fs.existsSync(cachedScriptPath) || !fs.existsSync(cachedReflPath)) {
      await fs.writeFile(cachedScriptPath, content);
      const module = await jiti(cachedScriptPath);

      const loadField = (field: string, defaultValue: string) => {
        const value = module[field];
        if (value === undefined || value === null) return defaultValue;
        if (typeof value === 'string') return value;
        if (typeof value === 'function') return value();
        return defaultValue;
      };
      const cliName = loadField('name', scriptName);
      const cliVersion = loadField('version', 'unknown');

      const refl: CachedReflection = {
        name: cliName,
        version: cliVersion,
        commands,
        optc: {
          version: OptcVersion
        }
      };
      await fs.writeFile(cachedReflPath, JSON.stringify(refl, null, 2), 'utf-8');

      const cli = new Optc(cachedScriptPath, {
        name: cliName,
        version: cliVersion
      });
      cli.setupCommands(module, commands);

      return cli;
    } else {
      const refl: CachedReflection = JSON.parse(await fs.readFile(cachedReflPath, 'utf-8'));
      if (refl?.optc?.version !== OptcVersion) {
        // Version is not matched, and disable reflection cache
        await fs.unlink(cachedReflPath);
        return initOptc();
      }

      const cli = new Optc(cachedScriptPath, refl);

      const module = await jiti(cachedScriptPath);
      cli.setupCommands(module, refl.commands);

      return cli;
    }
  };

  return await initOptc();
}

export async function bootstrap<T = any>(script: string, ...args: string[]): Promise<T> {
  return await (await makeOptc(script)).run<T>(args);
}

class Optc {
  private readonly scriptPath: string;

  private readonly cac: CAC;

  private commands: Command[] = [];

  constructor(scriptPath: string, option: { name: string; version: string }) {
    this.scriptPath = scriptPath;
    this.cac = cac(option.name);
    this.cac.version(option.version);
    this.cac.help();
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
