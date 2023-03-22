import { lightYellow } from 'kolorist';

export function logWarn(msg: string) {
  console.warn(`${lightYellow('Warn')} ${msg}`);
}

export async function importJiti(): Promise<typeof import('jiti').default> {
  const jiti = await import('jiti');
  // @ts-ignore
  return jiti.default ? jiti.default : jiti;
}
