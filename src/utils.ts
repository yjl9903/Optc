import { lightYellow } from 'kolorist';

export function logWarn(msg: string) {
  console.warn(`${lightYellow('Warn')} ${msg}`);
}
