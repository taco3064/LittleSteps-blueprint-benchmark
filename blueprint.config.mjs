import { defineBlueprint, reactPreset } from '@kekkai/blueprint';

const preset = reactPreset({ name: 'LittleSteps', modules: [] });
const modules = [
  { name: 'platform', does: 'Product-neutral browser, Firebase client, session and presentation primitives.' },
  { name: 'knowledge', does: 'Parenting reference content and cross-stage knowledge search.', dependsOn: ['platform'] },
  { name: 'family', does: 'Family profiles, pregnancy, shared child records and record access policy.', dependsOn: ['knowledge', 'platform'] },
  { name: 'portal', does: 'Product catalogue, entry policy, navigation and public product metadata.', dependsOn: ['family', 'knowledge', 'platform'] },
  { name: 'account', does: 'Account management and ordered account/data deletion.', dependsOn: ['family', 'portal', 'platform'] },
  { name: 'feedback', does: 'User feedback and place correction submission.', dependsOn: ['portal', 'platform'] },
  ...['littlesteps', 'littlebloom', 'littleexplorer', 'babyoasis', 'littleouting', 'littleguard'].map(name => ({
    name,
    does: {
      littlesteps: 'Infant care tracking and guidance workflows.',
      littlebloom: 'Pregnancy and prenatal care workflows.',
      littleexplorer: 'Toddler development and daily care workflows.',
      babyoasis: 'Nursing-room discovery and map interaction.',
      littleouting: 'Family venue discovery and outing planning.',
      littleguard: 'Public disease radar exploration.',
    }[name],
    dependsOn: {
      littlesteps: ['family', 'knowledge', 'platform', 'portal'],
      littlebloom: ['account', 'family', 'knowledge', 'platform', 'portal'],
      littleexplorer: ['account', 'family', 'knowledge', 'platform', 'portal'],
      babyoasis: ['account', 'feedback', 'knowledge', 'platform', 'portal'],
      littleouting: ['account', 'feedback', 'platform', 'portal'],
      littleguard: ['account', 'family', 'platform', 'portal'],
    }[name],
  })),
  { name: 'app', does: 'Application provider and route composition.', dependsOn: ['littlesteps', 'littlebloom', 'littleexplorer', 'babyoasis', 'littleouting', 'littleguard', 'account', 'feedback', 'portal', 'family', 'platform'] },
];

const layers = preset.architecture.layers.map(layer => ({ ...layer }));
layers.find(layer => layer.name === 'components').mustNot.push({
  id: 'application-io-and-routing',
  description: 'Perform application network IO or direct navigation.',
  checks: [{ capability: 'network-io' }, { capability: 'routing' }],
});

layers.push({
  name: 'domain',
  does: 'Pure domain data, contracts and calculations without UI, browser effects or network IO.',
  layout: 'folder', entry: 'index',
  mustNot: [{
    id: 'presentation-and-effects',
    description: 'Render UI, use lifecycle/state, access browser DOM or perform network IO.',
    checks: [
      { capability: 'render-ui' }, { capability: 'react-state' },
      { capability: 'react-lifecycle' }, { capability: 'browser-dom' },
      { capability: 'network-io' }, { capability: 'routing' },
      { package: 'leaflet' }, { package: 'react-leaflet' },
      { package: 'react-leaflet-cluster' }, { call: 'divIcon' },
    ],
  }],
});

export default defineBlueprint({
  ...preset,
  architecture: {
    ...preset.architecture,
    modules, layers,
    consumerFiles: ['vite.config.ts', 'scripts/**/*.{ts,js,mjs,cjs}', 'e2e/**/*.ts'],
  },
  rules: {
    ...Object.fromEntries(Object.entries(preset.rules).map(([id, setting]) => [
      id, typeof setting === 'string' ? 'error' : { ...setting, tier: 'error' },
    ])),
    moduleDependencySync: 'error',
  },
  emit: { agents: ['agents'], lint: { severity: 'error' } },
});
