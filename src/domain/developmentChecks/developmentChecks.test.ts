import { describe, it, expect } from 'vitest';
import type { DevelopmentDomain, ToddlerAgeBand } from '../records';
import {
  ageBandLabels,
  developmentCheckItems,
  developmentWarnings,
  domainLabels,
} from './developmentChecks';

const BANDS: ToddlerAgeBand[] = ['12-15', '15-18', '18-24', '24-30', '30-36'];

const DOMAINS: DevelopmentDomain[] = [
  'gross-motor',
  'fine-motor',
  'language',
  'cognitive',
  'social',
];

describe('developmentCheckItems', () => {
  it('共 30 題，且 id 唯一', () => {
    expect(developmentCheckItems).toHaveLength(30);
    const ids = developmentCheckItems.map((i) => i.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每個年齡段恰 6 題', () => {
    for (const band of BANDS) {
      const items = developmentCheckItems.filter((i) => i.ageBand === band);

      expect(items, band).toHaveLength(6);
    }
  });

  it('每個年齡段涵蓋全部 5 個發展面向，語言面向 2 題', () => {
    for (const band of BANDS) {
      const items = developmentCheckItems.filter((i) => i.ageBand === band);

      for (const domain of DOMAINS) {
        const count = items.filter((i) => i.domain === domain).length;

        expect(count, `${band} / ${domain}`).toBe(domain === 'language' ? 2 : 1);
      }
    }
  });

  it('每題都有題目、判準與至少一項練習建議', () => {
    for (const item of developmentCheckItems) {
      expect(item.title.length, item.id).toBeGreaterThan(0);
      expect(item.detail.length, item.id).toBeGreaterThan(0);
      expect(item.tips.length, item.id).toBeGreaterThan(0);
    }
  });
});

describe('developmentWarnings', () => {
  it('每個年齡段各一組紅旗警訊', () => {
    expect(developmentWarnings).toHaveLength(BANDS.length);

    expect(developmentWarnings.map((w) => w.ageBand).sort()).toEqual(
      [...BANDS].sort(),
    );
  });

  it('每組至少 2 條警訊，且都有轉介建議', () => {
    for (const warning of developmentWarnings) {
      expect(warning.signals.length, warning.ageBand).toBeGreaterThanOrEqual(2);
      expect(warning.action.length, warning.ageBand).toBeGreaterThan(0);
    }
  });
});

describe('顯示標籤', () => {
  it('所有年齡段與發展面向都有中文標籤', () => {
    for (const band of BANDS) {
      expect(ageBandLabels[band]).toBeTruthy();
    }

    for (const domain of DOMAINS) {
      expect(domainLabels[domain]).toBeTruthy();
    }
  });
});
