import { defineBlueprint, reactPreset } from '@kekkai/blueprint';

const preset = reactPreset({ name: 'LittleSteps LF benchmark' });

export default defineBlueprint({
  ...preset,
  architecture: {
    ...preset.architecture,
    layers: [
      ...preset.architecture.layers.map(layer => layer.name === 'services'
        ? { ...layer, owns: [...layer.owns, { package: 'firebase/**', pattern: true }] }
        : layer),
      {
        name: 'domain',
        does: 'Domain calculations, reference data, contracts, and browser policies.',
        mustNot: ['perform network IO', 'own React state or lifecycle', 'render UI'],
        layout: 'folder',
        entry: 'index',
      },
    ],
  },
  rules: {
    ...Object.fromEntries(Object.entries(preset.rules).map(([name, rule]) => [
      name, typeof rule === 'string' ? 'error' : { ...rule, tier: 'error' },
    ])),
    testFilename: {
      tier: 'error',
      allowAspectSuffix: true,
      suiteRoots: [
        { directory: 'test/integration', kind: 'integration' },
        { directory: 'test/contracts', kind: 'contract' },
        { directory: 'e2e/specs', kind: 'e2e' },
      ],
    },
  },
});
