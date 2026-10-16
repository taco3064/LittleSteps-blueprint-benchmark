import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint();
async function errors(source: string, filePath: string) {
  const [result] = await eslint.lintText(source, { filePath });
  return result.messages.filter(message => message.severity === 2);
}

describe('MF executable architecture boundaries', () => {
  it.each([
    ['domain renders JSX', 'src/babyoasis/domain/probe/probe.tsx',
      'export const view = <div />;', 'blueprint/must-not'],
    ['domain creates Leaflet icons', 'src/babyoasis/domain/probe/probe.ts',
      "import { divIcon } from 'leaflet';\nexport const icon = divIcon({});", 'blueprint/must-not'],
    ['domain imports map rendering library', 'src/babyoasis/domain/probe/probe.ts',
      "export { MapContainer } from 'react-leaflet';", 'blueprint/must-not'],
    ['domain owns browser effects', 'src/family/domain/probe/probe.ts',
      "export const title = document.title;", 'blueprint/must-not'],
    ['domain owns network IO', 'src/family/domain/probe/probe.ts',
      "export const load = () => fetch('/data');", 'blueprint/must-not'],
    ['domain owns React state', 'src/family/domain/probe/probe.ts',
      "import { useState } from 'react';\nexport const useProbe = () => useState(0);", 'blueprint/must-not'],
    ['components perform network IO', 'src/babyoasis/components/Probe/Probe.tsx',
      "export const load = () => fetch('/data');", 'blueprint/must-not'],
    ['platform depends on a business module', 'src/platform/domain/probe/probe.ts',
      "export { BabyOasisPage } from '~app/babyoasis';", 'no-restricted-imports'],
    ['inner layer depends on module root', 'src/babyoasis/components/Probe/Probe.tsx',
      "export { BabyOasisPage } from '~app/babyoasis';", 'no-restricted-imports'],
    ['external caller imports private module member', 'src/app/probe.ts',
      "export { default } from '~app/babyoasis/BabyOasisPage';", 'blueprint/import-boundary'],
  ])('%s is rejected as error', async (_title, filePath, source, rule) => {
    expect((await errors(source, filePath)).some(message => message.ruleId === rule)).toBe(true);
  });

  it('accepts pure domain calculations', async () => {
    expect(await errors('export const sum = (a: number, b: number) => a + b;\n',
      'src/family/domain/probe/probe.ts')).toEqual([]);
  });

  it('accepts presentation with ephemeral local state', async () => {
    const source = `import { useState } from 'react';

export function Probe() {
  const [open, setOpen] = useState(false);

  return <button onClick={() => setOpen(!open)}>{String(open)}</button>;
}
`;
    expect(await errors(source, 'src/babyoasis/components/Probe/Probe.tsx')).toEqual([]);
  });
});
