import { createElement, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { KeyboardEvent } from 'react';
import { pressable } from './pressable';
import WikiArticleCard from '../../../knowledge/components/WikiArticleCard/index';
import { SERVICE_THEME } from '../../../portal/components/ServiceTheme/index';
import {
  toddlerWikiArticles,
  toddlerWikiCategoryColors,
  toddlerWikiCategoryLabels,
} from '../../../knowledge/domain/toddlerWiki/data';

/**
 * `pressable` 是「可點的 div 也要能用鍵盤操作」的唯一實作。
 *
 * 這支測試分兩層：
 *
 *  1. 契約層——直接檢查回傳的 props 與 onKeyDown 的分支。用手工組出來的
 *     事件物件，才有辦法讓 `target` 與 `currentTarget` 真的不同；那條分支
 *     是巢狀按鈕（編輯、刪除）的 Enter 不會順便把外層那一列一起切換的原因，
 *     用 fireEvent 從 DOM 打是打不出這個組合的。
 *
 *  2. 行為層——真的渲染一張 WikiArticleCard，用鍵盤把它打開再關上。
 *     契約全對但沒接上去的情況存在過：這張卡片就是原本只有 onClick 的那個
 *     元件，三個知識庫共 85 篇文章因此在鍵盤下看得到卻打不開。props 正確
 *     不代表使用者按得到，所以要有一個真的按下去的證明。
 */

const noop = () => {};

/**
 * React 的 KeyboardEvent 有四十幾個欄位，onKeyDown 只讀四個。
 * 手工組出只帶那四個的物件，`target`/`currentTarget` 才能各自指定。
 */
function keyEvent(key: string, target: EventTarget, currentTarget: EventTarget) {
  const preventDefault = vi.fn();
  const event = { key, target, currentTarget, preventDefault };

  return { event: event as unknown as KeyboardEvent, preventDefault };
}

/** 事件從自己身上發出來的一般情況。 */
function selfKeyEvent(key: string) {
  const node = document.createElement('div');

  return keyEvent(key, node, node);
}

describe('pressable 回傳的 props', () => {
  it('把元素標成 button 並放進 tab 順序', () => {
    const props = pressable(noop);

    expect(props.role).toBe('button');
    expect(props.tabIndex).toBe(0);
  });

  it('onClick 就是傳進來的那個 callback', () => {
    const onPress = vi.fn();

    pressable(onPress).onClick();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('有傳 expanded 才有 aria-expanded', () => {
    expect(pressable(noop, false)['aria-expanded']).toBe(false);
    expect(pressable(noop, true)['aria-expanded']).toBe(true);
  });

  it('沒傳 expanded 時是 undefined，不是 false', () => {
    // 差別在 DOM 上是「沒有這個屬性」與「aria-expanded="false"」。
    // 後者等於告訴螢幕閱讀器「這裡可以展開，只是現在收著」——但食物記錄那幾
    // 列按下去是開編輯視窗，沒有東西會在原地展開。
    expect(pressable(noop)['aria-expanded']).toBeUndefined();
  });

  it('undefined 讓 React 真的不渲染那個屬性', () => {
    // 上一條測的是物件，這條測的是 React 對 undefined 的處理——
    // 契約要成立，兩件事都得是真的。
    render(createElement('div', { ...pressable(noop), children: '沒有展開狀態' }));
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-expanded');
  });
});

describe('pressable 的鍵盤處理', () => {
  it('Enter 觸發 callback 並吃掉預設行為', () => {
    const onPress = vi.fn();
    const { event, preventDefault } = selfKeyEvent('Enter');

    pressable(onPress).onKeyDown(event);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('空白鍵觸發 callback 並吃掉預設行為', () => {
    // 少了 preventDefault，鍵盤使用者按空白鍵得到的是「頁面往下捲一頁」，
    // 那一列不會有任何反應——真正的 <button> 不會這樣。
    const onPress = vi.fn();
    const { event, preventDefault } = selfKeyEvent(' ');

    pressable(onPress).onKeyDown(event);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('其他按鍵完全不管', () => {
    // Tab 要能離開、Escape 要能往上冒泡給 modal、字母鍵要能給搜尋框。
    for (const key of ['Tab', 'Escape', 'a', 'ArrowDown', 'Spacebar']) {
      const onPress = vi.fn();
      const { event, preventDefault } = selfKeyEvent(key);

      pressable(onPress).onKeyDown(event);
      expect(onPress, key).not.toHaveBeenCalled();
      expect(preventDefault, key).not.toHaveBeenCalled();
    }
  });

  it('從巢狀控制項冒泡上來的按鍵不算', () => {
    // FoodTrackingTab 那幾列裡面還有自己的按鈕。少了 target/currentTarget
    // 這道判斷，在巢狀按鈕上按 Enter 會同時觸發按鈕自己的動作與外層那一列。
    const row = document.createElement('div');
    const nestedButton = document.createElement('button');

    row.appendChild(nestedButton);

    for (const key of ['Enter', ' ']) {
      const onPress = vi.fn();
      const { event, preventDefault } = keyEvent(key, nestedButton, row);

      pressable(onPress).onKeyDown(event);
      expect(onPress, key).not.toHaveBeenCalled();
      // 也不能 preventDefault：那會把巢狀按鈕自己的鍵盤操作一起擋掉。
      expect(preventDefault, key).not.toHaveBeenCalled();
    }
  });
});

describe('WikiArticleCard 用鍵盤就能展開', () => {
  const article = toddlerWikiArticles[0];

  /** 和 ToddlerWikiPage 一樣，展開狀態由外面持有；卡片本身是受控的。 */
  function Harness() {
    const [expanded, setExpanded] = useState(false);

    return createElement(WikiArticleCard, {
      article,
      isExpanded: expanded,
      onToggle: () => setExpanded((open) => !open),
      categoryLabel: toddlerWikiCategoryLabels[article.category],
      categoryColors: toddlerWikiCategoryColors[article.category],
      theme: SERVICE_THEME.littleexplorer,
    });
  }

  it('可以聚焦、按 Enter 展開，再按一次收合', async () => {
    const user = userEvent.setup();

    // 資料前提：文章沒有處理步驟的話，展開與否在畫面上看不出差別。
    expect(article.solutions.length, article.id).toBeGreaterThan(0);

    render(createElement(Harness));

    const row = screen.getByRole('button', { name: new RegExp(article.title) });

    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('處理方式')).not.toBeInTheDocument();

    row.focus();
    expect(row).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('處理方式')).toBeInTheDocument();
    expect(screen.getByText(article.solutions[0].step)).toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(row).toHaveAttribute('aria-expanded', 'false');
    // AnimatePresence 的收合是動畫，節點會晚一點才離開 DOM。
    await waitFor(() => expect(screen.queryByText('處理方式')).not.toBeInTheDocument());
  });

  it('空白鍵一樣能展開，而且不會讓頁面捲動', async () => {
    const user = userEvent.setup();

    render(createElement(Harness));

    const row = screen.getByRole('button', { name: new RegExp(article.title) });

    row.focus();

    // React 18 把 handler 掛在 root container 上，不是掛在這個節點上，所以
    // 掛在 row 自己身上的 listener 會比 React 早跑，永遠讀到 false。
    // 掛到 document：冒泡到這裡時 React 已經處理完了。
    let defaultPrevented = false;

    const probe = (event: globalThis.KeyboardEvent) => {
      if (event.key === ' ') {
        defaultPrevented = event.defaultPrevented;
      }
    };

    document.addEventListener('keydown', probe);

    try {
      await user.keyboard('[Space]');
    } finally {
      document.removeEventListener('keydown', probe);
    }

    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('處理方式')).toBeInTheDocument();
    expect(defaultPrevented, '空白鍵沒被攔下，頁面會捲動而不是展開').toBe(true);
  });
});
