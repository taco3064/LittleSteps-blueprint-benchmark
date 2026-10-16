import { describe, it, expect } from 'vitest';
import type { ChildProfile, GrowthRecord } from '../familyRecords/index';
import { careTaskTemplates } from '../../../knowledge/domain/careTasks/index';
import {
  prenatalCheckupSchedule,
} from '../../../knowledge/domain/prenatalCheckups/index';
import { vaccineSchedules } from '../../../knowledge/domain/vaccines/index';
import { buildHealthTimeline } from './index';

/**
 * 四種形狀之前沒有任何共同介面，最寬的聚合器只涵蓋兩種。
 * 這組測試釘住「合起來之後仍然是同一批事件，一筆不多一筆不少」。
 */

const child = (over: Partial<ChildProfile> = {}): ChildProfile => ({
  id: 'c1',
  name: '小明',
  birthday: '2026-01-15',
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2026-01-15T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
  ...over,
});

const sources = (over: Partial<Parameters<typeof buildHealthTimeline>[0]> = {}) => ({
  child: child(),
  growthRecords: [] as GrowthRecord[],
  vaccineSchedules,
  careTaskTemplates,
  prenatalTemplates: prenatalCheckupSchedule,
  ...over,
});

describe('buildHealthTimeline', () => {
  it('四種形狀都進得來', () => {
    const timeline = buildHealthTimeline(
      sources({
        child: child({
          vaccineProgress: {
            'hepb-birth': {
              doses: { 1: { administered: true, administeredDate: '2026-01-16' } },
            },
          },
          prenatalProgress: {
            'prenatal-visit-1': { completedDate: '2025-06-10', clinicName: '某婦產科' },
          },
          careTaskProgress: {
            'health-check-18m': {
              taskId: 'health-check-18m',
              completedDate: '2027-08-01',
            },
          },
        }),
        growthRecords: [
          {
            id: 'g1',
            childId: 'c1',
            date: '2026-04-01',
            weight: 6.4,
            percentile: {},
          } as GrowthRecord,
        ],
      }),
    );

    expect(timeline.map((event) => event.kind).sort()).toEqual([
      'checkup',
      'growth',
      'prenatal',
      'vaccine',
    ]);
  });

  it('最新的在最前面', () => {
    const timeline = buildHealthTimeline(
      sources({
        growthRecords: [
          {
            id: 'a',
            childId: 'c1',
            date: '2026-03-01',
            weight: 5,
            percentile: {},
          } as GrowthRecord,
          {
            id: 'b',
            childId: 'c1',
            date: '2026-06-01',
            weight: 7,
            percentile: {},
          } as GrowthRecord,
        ],
      }),
    );

    expect(timeline.map((event) => event.date)).toEqual(['2026-06-01', '2026-03-01']);
  });

  it('產檢與兒童健檢併在同一條軸上，跨越出生', () => {
    // 這就是這個模組存在的理由：之前這兩件事在兩個服務、兩種形狀裡，
    // 講不出一句連續的故事。
    const timeline = buildHealthTimeline(
      sources({
        child: child({
          prenatalProgress: { 'prenatal-visit-1': { completedDate: '2025-06-10' } },
          careTaskProgress: {
            'health-check-18m': {
              taskId: 'health-check-18m',
              completedDate: '2027-08-01',
            },
          },
        }),
      }),
    );

    expect(timeline).toHaveLength(2);
    expect(timeline[0].kind).toBe('checkup');
    expect(timeline[1].kind).toBe('prenatal');
  });

  it('沒接種的劑次不算事件', () => {
    const timeline = buildHealthTimeline(
      sources({
        child: child({
          vaccineProgress: { 'hepb-birth': { doses: { 1: { administered: false } } } },
        }),
      }),
    );

    expect(timeline).toEqual([]);
  });

  it('接種了但沒填日期的劑次留在軸上，排最後', () => {
    // 丟掉它會讓時間軸看起來比實際少打了幾劑；它是打過的證據，
    // 只是放不進任何一天。
    const timeline = buildHealthTimeline(
      sources({
        child: child({
          vaccineProgress: {
            'hepb-birth': { doses: { 1: { administered: true } } },
            bcg: {
              doses: { 1: { administered: true, administeredDate: '2026-06-20' } },
            },
          },
        }),
      }),
    );

    expect(timeline).toHaveLength(2);
    expect(timeline[0].date).toBe('2026-06-20');
    expect(timeline[1].date).toBe('');
  });

  it('用真實的疫苗名稱，不是 id', () => {
    const timeline = buildHealthTimeline(
      sources({
        child: child({
          vaccineProgress: {
            'hepb-birth': {
              doses: { 1: { administered: true, administeredDate: '2026-01-16' } },
            },
          },
        }),
      }),
    );

    expect(timeline[0].title).toContain('B型肝炎');
  });

  it('成長紀錄只寫量到的那幾項', () => {
    const timeline = buildHealthTimeline(
      sources({
        growthRecords: [
          {
            id: 'g1',
            childId: 'c1',
            date: '2026-04-01',
            weight: 6.4,
            percentile: {},
          } as GrowthRecord,
        ],
      }),
    );

    expect(timeline[0].title).toContain('體重 6.4 kg');
    expect(timeline[0].title).not.toContain('頭圍');
  });

  it('什麼都沒記時是空的，不是一堆空殼', () => {
    expect(buildHealthTimeline(sources())).toEqual([]);
  });

  it('id 跨形狀不重複', () => {
    const timeline = buildHealthTimeline(
      sources({
        child: child({
          vaccineProgress: {
            v: { doses: { 1: { administered: true, administeredDate: '2026-02-01' } } },
          },
          careTaskProgress: { v: { taskId: 'v', completedDate: '2026-02-01' } },
        }),
        growthRecords: [
          {
            id: 'v',
            childId: 'c1',
            date: '2026-02-01',
            percentile: {},
          } as GrowthRecord,
        ],
      }),
    );

    const ids = timeline.map((event) => event.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
