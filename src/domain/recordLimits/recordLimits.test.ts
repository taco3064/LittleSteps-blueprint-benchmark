import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as limits from './recordLimits';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const rules = JSON.parse(
  readFileSync(join(ROOT, 'database.rules.json'), 'utf8'),
).rules;

/**
 * The form caps and the rule caps are two copies of one number. This test is
 * what stops them drifting: it walks to each field's rule and checks that
 * the `.validate` string enforces exactly the limit the form imports. How
 * the rule behaves is the emulator suite's job (scripts/testRules.cjs).
 */
const FIELDS: Array<[keyof typeof limits, string[]]> = [
  ['CHILD_NAME_LIMIT', ['children', '$childId', 'name']],
  [
    'DIARY_CONTENT_LIMIT',
    ['childRecords', '$childId', 'diaryEntries', '$entryId', 'content'],
  ],
  [
    'DAILY_LOG_NOTES_LIMIT',
    ['childRecords', '$childId', 'dailyLogs', '$logId', 'data', 'notes'],
  ],
  [
    'GROWTH_NOTES_LIMIT',
    ['childRecords', '$childId', 'growthRecords', '$recordId', 'notes'],
  ],
  [
    'PRENATAL_CLINIC_LIMIT',
    ['children', '$childId', 'prenatalProgress', '$templateId', 'clinicName'],
  ],
  [
    'PRENATAL_NOTES_LIMIT',
    ['children', '$childId', 'prenatalProgress', '$templateId', 'notes'],
  ],
  [
    'CARE_TASK_LOCATION_LIMIT',
    ['children', '$childId', 'careTaskProgress', '$taskId', 'location'],
  ],
  [
    'CARE_TASK_NOTES_LIMIT',
    ['children', '$childId', 'careTaskProgress', '$taskId', 'notes'],
  ],
  [
    'FOOD_NAME_LIMIT',
    ['children', '$childId', 'foodTrackingProgress', '$foodId', 'foodName'],
  ],
  [
    'FOOD_NOTES_LIMIT',
    ['children', '$childId', 'foodTrackingProgress', '$foodId', 'notes'],
  ],
  [
    'ALLERGY_DESCRIPTION_LIMIT',
    [
      'children',
      '$childId',
      'foodTrackingProgress',
      '$foodId',
      'allergyReactions',
      '$i',
      'description',
    ],
  ],
];

const ruleAt = (path: string[]): string =>
  path.reduce<Record<string, unknown>>(
    (node, key) => node[key] as Record<string, unknown>,
    rules,
  )['.validate'] as string;

describe('every form cap is the cap its rule enforces', () => {
  it.each(FIELDS)('%s', (name, path) => {
    // Parse the number rather than substring-match it: `<= 100` is a prefix
    // of `<= 1000`, so a rule raised by a trailing zero would stay green while
    // the form silently truncated below what the rule allows.
    const match = /newData\.val\(\)\.length <= (\d+)(?!\d)/.exec(ruleAt(path));

    expect(match?.[1]).toBeDefined();
    expect(Number(match?.[1])).toBe(limits[name]);
  });

  it('lists every limit the module exports', () => {
    // A new constant with no row here would be a cap nothing checks.
    expect(FIELDS.map(([name]) => name).sort()).toEqual(Object.keys(limits).sort());
  });
});
