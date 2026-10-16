import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AboutPage } from '../../index';
import {
  COVERAGE,
  DATA_SOURCES,
  DEVICE_STORE_DESCRIBED,
} from '~app/portal/domain/dataSources/dataSources';
import { savePreferences } from '~app/portal/services/preferences/preferences';

/**
 * What a parent can see and reach on the page. The claims themselves are
 * held against the data in `dataSources.test.ts`; this file asserts that the
 * page actually shows them and that its one control works.
 */
describe('AboutPage', () => {
  it('renders without a signed-in user, because it is written for one', () => {
    render(<AboutPage />);

    // One h1, in the AppBar, like every page that has one.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '關於資料',
    );

    // The tagline is two inline-blocks so a phone breaks between the clauses;
    // match the paragraph, not a text node.
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === 'P' && el.textContent === '你的資料，和我們的資料',
      ),
    ).toBeInTheDocument();
  });

  it('prints every coverage number with its unit', () => {
    render(<AboutPage />);

    for (const { value, unit } of COVERAGE) {
      expect(screen.getByText(unit)).toBeInTheDocument();

      expect(
        screen.getByText(new Intl.NumberFormat('zh-TW').format(value)),
      ).toBeInTheDocument();
    }
  });

  it('links every source card to its publisher, opening outside the app', () => {
    render(<AboutPage />);
    const links = screen.getAllByRole('link', { name: '開啟原始資料' });

    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      DATA_SOURCES.map((source) => source.sourceUrl),
    );

    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it(
    'describes everything the device store can hold, and nothing about '
    + 'a child',
    () => {
      render(<AboutPage />);
      const sentence = screen.getByText(/存在瀏覽器裡的只有/);

      for (const phrase of Object.values(DEVICE_STORE_DESCRIBED)) {
        expect(sentence).toHaveTextContent(phrase);
      }

      // The sentence describes a store that, by construction, never names a
      // child. If a phrase here ever reads like one, the store has changed.
      for (const phrase of Object.values(DEVICE_STORE_DESCRIBED)) {
        expect(phrase).not.toMatch(/名字|姓名|生日|紀錄|寶寶的/);
      }
    },
  );

  it(
    'keeps that sentence true after a parent has actually saved a '
    + 'preference',
    () => {
      // A stored preference is view state; the page's sentence must still be the
      // complete description of what is on the device.
      savePreferences({ guardCounty: '臺北市', oasisExcludeInternal: true });
      render(<AboutPage />);

      expect(screen.getByText(/存在瀏覽器裡的只有/)).toHaveTextContent(
        '上次看的縣市',
      );
    },
  );

  it('discloses contact details as something the parent has to ask for', () => {
    // The page used to promise the opposite — that a report always carries the
    // sender's Google name and email. The form asks now, so the only honest
    // sentence here is the conditional one.
    render(<AboutPage />);

    expect(screen.getByText(/Google 帳號名稱與 email/).textContent).toMatch(
      /只有.*勾.*才會/,
    );
  });

  it('keeps the medical disclaimer on the page', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', { name: '這不是醫療建議' }),
    ).toBeInTheDocument();

    expect(screen.getByText(/不能取代醫師的判斷/)).toBeInTheDocument();
  });

  it(
    'promises the whole record leaves as a file, not only the ' + 'summaries',
    () => {
      // The section used to name the clinic summary, the weekly report and the
      // calendar export and stop there: three digests, none of them the record.
      // A parent reading "帶得走" is owed the whole thing (#94).
      render(<AboutPage />);

      expect(
        screen.getByRole('heading', { name: '隨時帶得走，也刪得掉' }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(/整份紀錄可以一鍵匯出成檔案/),
      ).toBeInTheDocument();
    },
  );

  it(
    'promises that the account itself can go, and says what a shared '
    + 'child does',
    () => {
      // The page may only promise what the product does. Before the account
      // sheet had a 刪除帳號 action this sentence would have been a lie, and a
      // parent reading it is deciding whether to hand over an account.
      render(<AboutPage />);
      const paragraph = screen.getByText(/帳號本身也刪得掉/);

      expect(paragraph).toHaveTextContent('只有你一個人在用的孩子會整份消失');
      expect(paragraph).toHaveTextContent('還有家人在用的則是把你從名單上移除');
    },
  );

  it(
    'reads in the order its own title promises: take it away, then '
    + 'delete it',
    () => {
      // Four separate sentences arrived in that section from three different
      // changes, and the order they landed in was delete, delete, take, take —
      // the reverse of the heading, with the export answer split in two.
      render(<AboutPage />);

      const section = screen.getByRole('heading', {
        name: '隨時帶得走，也刪得掉',
      }).parentElement;

      const paragraphs = [...(section?.querySelectorAll('p') ?? [])].map(
        (p) => p.textContent ?? '',
      );

      expect(paragraphs.map((text) => text.slice(0, 8))).toEqual([
        '整份紀錄可以一鍵',
        '看診摘要、週報與',
        '刪掉一個孩子是一',
        '帳號本身也刪得掉',
      ]);
    },
  );

  it(
    'opens the technical details on demand and keeps them closed by '
    + 'default',
    async () => {
      const user = userEvent.setup();

      render(<AboutPage />);

      const toggle = screen.getByRole('button', { name: '想看細節的話' });

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText(/唯一的授權邊界/)).not.toBeInTheDocument();

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText(/唯一的授權邊界/)).toBeInTheDocument();
    },
  );

  it('has a way back to the entry point', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('button', { name: '返回所有服務' }),
    ).toBeInTheDocument();
  });

  it(
    'carries exactly one kind of icon: the mark on links that leave '
    + 'the app',
    () => {
      // The design system allows an icon only where it carries meaning the words
      // do not. On this page that is the external-link mark and the disclosure
      // chevron; a decorative glyph beside a heading would show up here.
      const { container } = render(<AboutPage />);
      const svgs = container.querySelectorAll('svg');

      // one per source card, one chevron on the disclosure, one back arrow
      expect(svgs.length).toBe(DATA_SOURCES.length + 2);
    },
  );
});
