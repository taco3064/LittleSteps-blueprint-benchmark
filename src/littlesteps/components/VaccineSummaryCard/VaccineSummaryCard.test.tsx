import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { VaccineProgress } from '../../../family/domain/familyRecords/index';
import type { VaccineSchedule } from '../../../knowledge/domain/referenceModels/index';
import { vaccineSchedules } from '../../../knowledge/domain/vaccines/data';
import VaccineSummaryCard from './VaccineSummaryCard';

/**
 * 這張卡片有三種狀態，而且三種都在講同一件事的不同面向：這個孩子還欠什麼。
 *
 * #25 修掉的是「把要自己付錢的劑次寫成下一劑」；#50 修的是剩下那一種狀態
 * 說得太少——公費打完的那一刻正是家長想知道還剩什麼的時候，而隔壁那個狀態
 * 明明說得出數字。所以這裡驗的是「有沒有給出數字」與「有沒有把自費劑次寫
 * 成待辦」，不是文案本身。
 */

/** 公費常規劑次：帶 eligibility 的那種只給名單上的孩子，不是家長欠的。 */
const NATIONAL = vaccineSchedules.filter(
  (v) => v.funding === 'national' && !v.eligibility,
);

const doseOf = (vaccine: VaccineSchedule): number => vaccine.currentDose ?? 1;

/** 把指定的每一筆記錄標成已接種。同 id 的多劑要合併，不能互相覆蓋。 */
const administered = (vaccines: VaccineSchedule[]): VaccineProgress => {
  const progress: VaccineProgress = {};

  for (const vaccine of vaccines) {
    const doses = progress[vaccine.id]?.doses ?? {};

    doses[doseOf(vaccine)] = { administered: true, administeredDate: '2026-01-01' };
    progress[vaccine.id] = { doses };
  }

  return progress;
};

const renderCard = (progress: VaccineProgress, birthday: string) =>
  render(
    <VaccineSummaryCard
      vaccineProgress={progress}
      birthday={birthday}
      onNavigate={vi.fn()}
    />,
  );

/** 卡片全文。三種狀態各自一句話，比對整張卡最省事也最不會誤判。 */
const cardText = () => screen.getByRole('button').textContent ?? '';

describe('VaccineSummaryCard', () => {
  it('公費都記完之後，說得出還剩幾劑不在公費常規時程內', () => {
    // 這就是 #50：計數器寫著 20/36，家長看得出差 16 劑，卡片卻只說「其餘
    // 劑次不在公費時程內」——三種狀態裡唯一不給數字的那一種。
    const remaining = vaccineSchedules.length - NATIONAL.length;

    expect(remaining).toBeGreaterThan(0);

    renderCard(administered(NATIONAL), '2020-01-15');

    expect(cardText()).toContain(`另有 ${remaining} 劑`);
  });

  it('不能只說它們不是公費，得說到接下來能怎麼辦', () => {
    // #50 要的是「別在這裡停住」：說得出數字的那一刻也要說這些劑次還能不能
    // 打。原本驗的是 /仍可.*接種/，但那句話對走到這個狀態的孩子多半是假的
    // ——16 劑裡有 8 劑封了年齡上限——所以現在驗的是有沒有把人帶到醫師那裡，
    // 而不是有沒有承諾都還打得到。承諾那一句是被刻意拿掉的，別再加回來。
    renderCard(administered(NATIONAL), '2020-01-15');
    const text = cardText();

    expect(text).toMatch(/請與醫師討論/);
    expect(text).not.toMatch(/仍可依需要接種/);
  });

  it('不推銷、也不把要自己付錢的劑次寫成下一劑', () => {
    // #25 的規矩仍然成立：這個狀態可以說「還有幾劑」，不能說「下一劑是哪一
    // 支」。指名任何一支自費產品就是在替它背書。
    renderCard(administered(NATIONAL), '2020-01-15');
    const text = cardText();

    expect(text).not.toContain('下次接種');

    // 條件同 isScheduledDose，也就是這句話講的那一群：不是「非公費」。公費
    // 但帶條件的那一劑同樣不該被指名——它偏偏是唯一被算進差額、又長得像公
    // 費的一列，被寫進文案時傷害最大，而 funding !== 'national' 正好漏掉它。
    const outside = vaccineSchedules.filter(
      (v) => !(v.funding === 'national' && !v.eligibility),
    );

    expect(outside.length).toBeGreaterThan(0);
    expect(outside.some((v) => v.funding === 'national')).toBe(true);
    outside.forEach((v) => expect(text, `${v.id} 被指名了`).not.toContain(v.name));
  });

  it('整份時程表都記完時不會說「另有 0 劑」', () => {
    renderCard(administered(vaccineSchedules), '2020-01-15');

    expect(cardText()).not.toContain('另有 0 劑');
  });

  it('公費還沒記完時，講的仍然是還有幾劑沒有記錄', () => {
    // 相反的那一種狀態。兩句話不能混在一起：一種是「你可能漏記了」，另一種
    // 是「沒有免費的可打了」，把它們說成同一句就是 #25 之前的毛病。
    renderCard({}, '2020-01-15');
    const text = cardText();

    expect(text).toContain(`尚有 ${NATIONAL.length} 劑公費疫苗沒有記錄`);
    expect(text).not.toContain('另有');
  });

  it('還有下一劑時，這兩句話都不出現', () => {
    renderCard({}, new Date().toISOString().slice(0, 10));
    const text = cardText();

    expect(text).toContain('下次接種');
    expect(text).not.toContain('沒有記錄');
    expect(text).not.toContain('另有');
  });
});
