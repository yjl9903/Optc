import fs from 'fs-extra';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

// @ts-ignore
import BabelTsPlugin from '@babel/plugin-transform-typescript';

import { version as OptcVersion } from '../package.json';

import { Optc } from './optc';
import { importJiti } from './utils';
import { OPTC_CACHE, CACHE_ROOT } from './space';
import { Command, ReflectionPlugin } from './reflect';

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
      description: string;
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
      const cliDescription = loadField('description', '');

      const refl: CachedReflection = {
        name: cliName,
        description: cliDescription,
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
