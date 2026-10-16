import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FORBIDDEN_WORDS } from '../radar/index';
import { DISEASE_INFO, DISEASE_PART_INFO, DISEASE_PART_OF } from './index';

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * 名單一律從實際出貨的資料推出來，不手寫：板上有哪幾列＝資料裡的病種減掉
 * DISEASE_PART_OF 收起來的那幾種。上游哪天多一種病，缺說明就在這裡爆掉，而不
 * 是等家長點開抽屜拿到一片空白。
 */
const { diseases } = JSON.parse(
  readFileSync(join(HERE, '../../../../public/data/diseaseRadar.json'), 'utf8'),
) as { diseases: string[] };

const BOARD = diseases.filter((name) => !(name in DISEASE_PART_OF));
const PARTS = diseases.filter((name) => name in DISEASE_PART_OF);

/** 每一筆說明的所有可見文字，禁用詞與絕對化表述都掃這一串。 */
const allText = (disease: string) => {
  const info = DISEASE_INFO[disease];

  return [info.meaning, info.seeDoctor, ...info.actions].join('');
};

describe('板上每一列的說明', () => {
  it('板上有幾列就有幾筆說明，一筆不多一筆不少', () => {
    expect(Object.keys(DISEASE_INFO).sort()).toEqual([...BOARD].sort());
  });

  it.each(BOARD)('%s 的六個欄位都不是空的', (disease) => {
    const info = DISEASE_INFO[disease];

    expect(info.meaning.length).toBeGreaterThan(0);
    expect(info.seeDoctor.length).toBeGreaterThan(0);
    expect(info.sourceUrl).toMatch(/^https:\/\/www\.cdc\.gov\.tw\//);
    expect(info.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it.each(BOARD)('%s 至少給得出兩件可以做的事', (disease) => {
    // 每一個「變多」都必須同時給得出可以做什麼；只講風險不講行動就是製造焦慮。
    expect(DISEASE_INFO[disease].actions.length).toBeGreaterThanOrEqual(2);

    DISEASE_INFO[disease].actions.forEach((action) =>
      expect(action.length).toBeGreaterThan(0),
    );
  });

  it.each(BOARD)('%s 的 Q&A 連結若存在也是疾管署的', (disease) => {
    const { qaUrl } = DISEASE_INFO[disease];

    if (qaUrl !== undefined) {
      expect(qaUrl).toMatch(/^https:\/\/www\.cdc\.gov\.tw\//);
    }
  });

  it('沒有任何一段文字用到禁用詞', () => {
    const texts = Object.values(DISEASE_INFO).map((info) =>
      [info.meaning, info.seeDoctor, ...info.actions].join(''),
    );

    for (const text of [
      ...texts,
      ...Object.values(DISEASE_PART_INFO).map((p) => p.meaning),
    ]) {
      for (const word of FORBIDDEN_WORDS) {
        expect(text).not.toContain(word);
      }
    }
  });

  it.each(BOARD)('%s 沒有把話說成絕對', (disease) => {
    // 「一定」「絕對」「不會」這種話衛教文字擔不起：它們把機率寫成保證，錯了
    // 就是誤導。「不一定」也含「一定」，所以整串掃過去。
    expect(allText(disease)).not.toContain('一定');
    expect(allText(disease)).not.toContain('絕對');
  });

  it.each(BOARD)('%s 沒有用箭頭或驚嘆號催人', (disease) => {
    expect(allText(disease)).not.toMatch(/[↑↓→←!！⚠]/);
  });

  it.each(BOARD)('%s 沒有把家長推去談接種', (disease) => {
    // 疫苗是 LittleSteps 的疫苗追蹤在管的（spec §1.3「疫苗追蹤功能不重做」）。
    // 雷達只回答「外面在流行什麼」；一開始講接種就跨進另一個服務的職責，也踩到
    // spec §10「不做醫療建議」。連「問問醫師接種時程」都算，所以掃整串。
    expect(allText(disease)).not.toContain('疫苗');
    expect(allText(disease)).not.toContain('接種');
  });

  it.each(BOARD)('%s 的就醫時機只寫看得見的徵象', (disease) => {
    // 這個欄位只能是家長看得到的東西。「該去哪一級醫院」是分流指示，「哪些族群
    // 風險較高」是流行病學陳述——兩者都不是徵象，都不屬於這裡。
    const { seeDoctor } = DISEASE_INFO[disease];

    // 「併發症」是診斷分類，不是家長看得見的東西——看得見的是「水泡周圍紅腫」。
    ['大醫院', '高危險', '風險', '族群', '併發症'].forEach((word) =>
      expect(seeDoctor).not.toContain(word),
    );
  });

  it.each(BOARD)('%s 說清楚了這一格是門診就診人次而不是確診數', (disease) => {
    // 名稱落差是這個服務最容易誤導人的地方：上游六個 dataset 都是健保門診就診
    // 人次，疾管署同名的疾病介紹卻常常只涵蓋重症或併發症。
    expect(DISEASE_INFO[disease].meaning).toContain('門診就診人次');
  });

  it('每一列都指向自己那一頁，沒有複製貼上沒改到的', () => {
    const urls = BOARD.map((disease) => DISEASE_INFO[disease].sourceUrl);

    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('腸病毒底下的兩種表現', () => {
  it('被收起來的每一種都有一句話說明', () => {
    expect(Object.keys(DISEASE_PART_INFO).sort()).toEqual([...PARTS].sort());
  });

  it.each(PARTS)('%s 掛在板上真的有的那一列', (part) => {
    // 掛到一個板上不存在的病名，那一列的組成就永遠長不出來，而且不會有人發現。
    expect(BOARD).toContain(DISEASE_PART_OF[part]);
  });

  it.each(PARTS)('%s 那一句話講的是家長分得出來的樣子', (part) => {
    // 這一句唯一的任務是讓家長分得出兩個名字的差別：症狀與病程，不是再一份
    // 洗手指南——預防作為與就醫時機和腸病毒逐字相同，留在 DISEASE_INFO 就好。
    const { meaning } = DISEASE_PART_INFO[part];

    expect(meaning.length).toBeGreaterThan(0);
    expect(meaning).not.toContain('一定');
    expect(meaning).not.toContain('絕對');
    expect(meaning).not.toMatch(/[↑↓→←!！⚠]/);
  });
});
