import type { PrenatalItemKind } from '~app/domain/prenatalCheckups';

import type { PrenatalItemStatus } from '~app/domain/prenatalSchedule';

import { SERVICE_THEME } from '~app/domain/serviceTheme';

import { toLocalDateKey } from '~app/domain/dateHelpers';

export const THEME = SERVICE_THEME.littlebloom;

/* 分類徽章：底色用淡的 DEFAULT 色階，字用同名的 -ink 才讀得到。 */
export const KIND_STYLE: Record<PrenatalItemKind, string> = {
  checkup: 'bg-bloom-dusty-rose/15 text-bloom-dusty-rose-ink',
  ultrasound: 'bg-bloom-dusty-blue/20 text-bloom-dusty-blue-ink',
  screening: 'bg-bloom-sage/20 text-bloom-sage-ink',
  vaccine: 'bg-bloom-mauve/20 text-bloom-mauve-ink',
};

export const SECTIONS: { status: PrenatalItemStatus; title: string }[] = [
  { status: 'overdue', title: '已過建議週數' },
  { status: 'due', title: '現在可以做' },
  { status: 'upcoming', title: '接下來' },
];

/* 已完成殿後，中間還要夾一區建檔前就到期的，所以不和上面三個放同一個陣列。 */
export const DONE_SECTION: { status: PrenatalItemStatus; title: string } = {
  status: 'done',
  title: '已完成',
};

export const today = () => toLocalDateKey();
