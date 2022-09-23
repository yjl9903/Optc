import os from 'node:os';
import path from 'node:path';

export const OPTC_ROOT = process.env.OPTC_ROOT
  ? path.resolve(process.env.OPTC_ROOT)
  : path.join(os.homedir(), '.optc');
