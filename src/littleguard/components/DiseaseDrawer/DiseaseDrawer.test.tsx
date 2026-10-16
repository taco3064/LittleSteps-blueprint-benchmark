import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DISEASE_INFO,
  DISEASE_PART_INFO,
  DISEASE_PART_OF,
} from '../../domain/diseases/index';
import {
  FORBIDDEN_WORDS,
  STATUS_COPY,
  type RadarStatus,
} from '../../domain/radar/index';
import type { RadarCell, RadarData } from '../../domain/radarModels/index';
import DiseaseDrawer from './index';

/** 上游六支 dataset；板上只有四列，兩種表現收在腸病毒底下。 */
const DISEASES = ['腸病毒', '手足口病', '疱疹性咽峽炎', '類流感', '腹瀉', '水痘'];
const BOARD = DISEASES.filter((name) => !(name in DISEASE_PART_OF));

function cell(overrides: Partial<RadarCell> = {}): RadarCell {
  return {
    rate: 169,
    trendBase: 79.4,
    ratio: 2.13,
    geoRatio: 1.4,
    visits: 35,
    denom: 2071,
    reliability: 'ok',
    spark: [70, 74, 79, 81, 88, 104, 132, 169],
    ...overrides,
  };
}

/** statusOf 的九個分支各自對得上一顆格子。狀態文案一律從 STATUS_COPY 取。 */
const CELL_BY_STATUS: Record<RadarStatus, RadarCell> = {
  risingStrong: cell({ ratio: 2.13 }),
  rising: cell({ ratio: 1.4 }),
  steady: cell({ ratio: 1.01 }),
  falling: cell({ ratio: 0.5 }),
  noBaseline: cell({ trendBase: null, ratio: null }),
  none: cell({ rate: 0, trendBase: 0, ratio: null, visits: 0 }),
  emerged: cell({ rate: 12, trendBase: 0, ratio: null, visits: 3 }),
  smallSample: cell({ denom: 640, reliability: 'small' }),
  insufficient: cell({
    rate: null,
    trendBase: null,
    ratio: null,
    visits: 0,
    denom: 42,
    reliability: 'insufficient',
    spark: new Array(8).fill(null),
  }),
};

function data(): RadarData {
  const national = Object.fromEntries(
    DISEASES.map((name) => [name, { rate: 128.5 }]),
  );

  return {
    week: '2026-W34',
    weekStart: '2026-08-23',
    weekEnd: '2026-08-29',
    generatedAt: '2026-09-03T01:00:00.000Z',
    verifiedOn: '2026-09-03',
    source: '衛生福利部疾病管制署 健保門診及住院就診人次統計',
    sourceUrls: ['https://od.cdc.gov.tw/eic/NHI_Enterovirus.csv'],
    license: '政府資料開放授權條款-第1版',
    diseases: DISEASES,
    ageBands: ['0~2', '3~6', '7~12'],
    calibration: {
      trendP25: 0.74,
      trendP50: 0.99,
      trendP75: 1.29,
      trendP90: 1.9,
      sampleSize: 54468,
    },
    national: { '0~2': national, '3~6': national, '7~12': national },
    counties: {},
  };
}

const noop = () => {};

/** 腸病毒那一列底下掛兩種表現，形狀跟 RadarPage 餵進來的一樣；其他三列沒有。 */
function open(
  disease = '腸病毒',
  overrides: Partial<RadarCell> = {},
  onClose = noop,
) {
  return render(
    <DiseaseDrawer
      disease={disease}
      cell={cell(overrides)}
      parts={
        disease === '腸病毒'

          ? [
              { disease: '手足口病', cell: cell({ visits: 15 }) },
              { disease: '疱疹性咽峽炎', cell: cell({ visits: 20 }) },
            ]

          : undefined
      }
      data={data()}
      county="台北市"
      age="3~6"
      showStatus
      onClose={onClose}
    />,
  );
}

const bodyText = () => screen.getByRole('dialog').textContent ?? '';

/** 詳細數字預設收著，要斷言 dl 裡的東西就得先按開。 */
const openDetails = () =>
  userEvent.setup().click(screen.getByRole('button', { name: '詳細數字' }));

describe('抽屜的順序', () => {
  it('先說這個名字在資料裡是什麼，再給可以做的事，數字放最後', () => {
    // 反過來的話家長會先被數字嚇一跳，才知道自己能做什麼。
    open();
    const body = bodyText();

    const order = [
      DISEASE_INFO['腸病毒'].meaning.slice(0, 8),
      '這一週的組成',
      '可以做什麼',
      '什麼情況要看醫生',
      '最近 8 週',
      '次因腸病毒就診',
    ].map((needle) => body.indexOf(needle));

    order.forEach((at) => expect(at).toBeGreaterThan(-1));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('可以做什麼一定在數字之前', () => {
    open();
    const body = bodyText();

    expect(body.indexOf('可以做什麼')).toBeGreaterThan(-1);
    expect(body.indexOf('可以做什麼')).toBeLessThan(body.indexOf('次因腸病毒就診'));
  });
});

describe('抽屜的內容', () => {
  it('板上四列都打得開，說明、行動、就醫時機三塊都在', () => {
    BOARD.forEach((disease) => {
      const view = open(disease);
      const body = bodyText();
      const info = DISEASE_INFO[disease];

      expect(body).toContain(info.meaning);
      expect(body).toContain(info.seeDoctor);
      info.actions.forEach((action) => expect(body).toContain(action));
      view.unmount();
    });
  });

  it('行動是逐條列出來的清單，不是一坨字', () => {
    open();

    const actions = screen
      .getByRole('heading', { name: '可以做什麼' })
      .closest('section');

    const items = within(actions as HTMLElement).getAllByRole('listitem');

    expect(items).toHaveLength(DISEASE_INFO['腸病毒'].actions.length);
    expect(items[0]).toHaveTextContent(DISEASE_INFO['腸病毒'].actions[0]);
  });

  it('數字先用一句話講完：哪裡、幾歲、幾次、跟平常差多少', () => {
    // 「423.0/萬」是統計人員的單位；家長要的是「這一週有幾次，比平常多還是少」。
    open('類流感', { visits: 413, ratio: 1.44 });

    expect(
      screen.getByText(
        '台北市 3-6 歲這一週有 413 次因類流感就診，比前 8 週的平常值多約 44%。',
      ),
    ).toBeInTheDocument();
  });

  it('第二句回答「那這裡跟全台比呢」', () => {
    open('類流感', { geoRatio: 1.4 });
    expect(screen.getByText('跟全國同一週相比，這裡偏多。')).toBeInTheDocument();
  });

  it('全國比不出來就不寫第二句，不編一個方向', () => {
    open('類流感', { geoRatio: null });
    expect(screen.queryByText(/跟全國同一週相比/)).not.toBeInTheDocument();
  });

  it('詳細數字預設收著，按下去才展開', async () => {
    open();
    const toggle = screen.getByRole('button', { name: '詳細數字' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('統計基數')).not.toBeInTheDocument();
    expect(bodyText()).not.toContain('169.0/萬');

    await openDetails();

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('統計基數')).toBeInTheDocument();

    // aria-controls 要真的指得到展開出來的那一塊，不是掛一個不存在的 id。
    expect(
      document.getElementById(toggle.getAttribute('aria-controls') ?? ''),
    ).toContainElement(screen.getByText('統計基數'));
  });

  it('詳細數字那顆按鈕按得到——44px 是拇指的下限', () => {
    open();

    expect(screen.getByRole('button', { name: '詳細數字' }).className).toContain(
      'min-h-tap',
    );
  });

  it('率、人次、分母三個都給，數字才讀得懂', async () => {
    // 只給「169.0/萬」的話沒人知道那是幾個人；只給「35 人次」的話沒人知道
    // 是幾個人裡的 35 個。分母是這一格數字的可信度本身。
    open();
    await openDetails();
    const body = bodyText();

    expect(body).toContain('169.0/萬');
    expect(body).toContain('35 人次');
    expect(screen.getByText('統計基數')).toBeInTheDocument();
    expect(body).toContain('2,071 次門診');
  });

  it('說清楚「/萬」跟統計基數是什麼意思', async () => {
    open();
    await openDetails();
    expect(screen.getByText(/每一萬次健保門診/)).toBeInTheDocument();
  });

  it('前 8 週中位數與全國同一週都拿得到，才比得出來', async () => {
    open();
    await openDetails();
    const body = bodyText();

    expect(screen.getByText('前 8 週中位數')).toBeInTheDocument();
    expect(body).toContain('79.4/萬');
    expect(screen.getByText('全國同一週')).toBeInTheDocument();
    expect(body).toContain('128.5/萬');
  });

  it('全國那一層抓不到就顯示破折號，不留空格也不編一個數字', async () => {
    const bare = data();

    bare.national = {};

    render(
      <DiseaseDrawer
        disease="腸病毒"
        cell={cell()}
        data={bare}
        county="台北市"
        age="3~6"
        showStatus
        onClose={noop}
      />,
    );

    await openDetails();
    expect(screen.getByText('全國同一週').parentElement).toHaveTextContent('—');
  });

  it('連得出疾管署，而且是新分頁開', () => {
    open();
    const link = screen.getByRole('link', { name: /疾管署的腸病毒說明/ });

    expect(link).toHaveAttribute('href', DISEASE_INFO['腸病毒'].sourceUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it.each(BOARD)('%s 的連結指向自己那一頁', (disease) => {
    const view = open(disease);

    expect(
      screen.getByRole('link', { name: new RegExp(`疾管署的${disease}說明`) }),
    ).toHaveAttribute('href', DISEASE_INFO[disease].sourceUrl);

    view.unmount();
  });

  it('關得掉', async () => {
    const onClose = vi.fn();

    open('腸病毒', {}, onClose);
    await userEvent.setup().click(screen.getByRole('button', { name: '關閉' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('這一週的組成', () => {
  it('腸病毒說得出兩種表現各自的人次與樣子', () => {
    // 板上只列腸病毒一列，家長會問「那手足口病呢」。答案就在這一段。
    open();

    expect(
      screen.getByRole('heading', { name: '這一週的組成' }),
    ).toBeInTheDocument();

    const body = bodyText();

    expect(body).toContain(
      '手足口病與疱疹性咽峽炎都是腸病毒的表現。這份資料裡兩者相加就是腸病毒的全部，所以板上只列一項。',
    );

    expect(body).toContain('15 人次');
    expect(body).toContain('20 人次');
    expect(body).toContain(DISEASE_PART_INFO['手足口病'].meaning);
    expect(body).toContain(DISEASE_PART_INFO['疱疹性咽峽炎'].meaning);
  });

  it('沒有東西掛在底下的那一列不長出這一段', () => {
    open('類流感');
    expect(screen.queryByText('這一週的組成')).not.toBeInTheDocument();
  });
});

describe('抽屜的狀態與樣本', () => {
  it.each(Object.keys(CELL_BY_STATUS) as RadarStatus[])(
    '%s 的文案與色階都從 STATUS_COPY 取',
    (status) => {
      const view = render(
        <DiseaseDrawer
          disease="腸病毒"
          cell={CELL_BY_STATUS[status]}
          data={data()}
          county="台北市"
          age="3~6"
          showStatus
          onClose={noop}
        />,
      );

      const copy = screen.getByText(STATUS_COPY[status].label);

      expect(copy).toHaveClass(STATUS_COPY[status].tone);
      view.unmount();
    },
  );

  it('樣本夠的時候不加但書', () => {
    open();
    expect(screen.queryByText(/容易上下跳動/)).not.toBeInTheDocument();
  });

  it.each(['small', 'insufficient'] as const)(
    '樣本是 %s 就在第一層說一聲',
    (reliability) => {
      // 但書跟第一層那句百分比同層：要收起來的是統計欄位，不是保留意見。
      const view = open('腸病毒', { reliability, denom: 300 });

      expect(screen.getByText(/容易上下跳動/)).toBeInTheDocument();

      expect(screen.getByRole('button', { name: '詳細數字' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );

      view.unmount();
    },
  );

  it('資料不足的那一格不畫線，也不假裝算得出比率', async () => {
    const { container } = render(
      <DiseaseDrawer
        disease="腸病毒"
        cell={CELL_BY_STATUS.insufficient}
        data={data()}
        county="台北市"
        age="3~6"
        showStatus
        onClose={noop}
      />,
    );

    expect(container.querySelector('svg[role="img"]')).toBeNull();
    expect(screen.getByText('資料不足')).toBeInTheDocument();

    // 第一句照樣講得出人次，比不出來的部分用板上同一套說法帶過。
    expect(
      screen.getByText(
        `台北市 3-6 歲這一週有 0 次因腸病毒就診，${STATUS_COPY.noBaseline.label}。`,
      ),
    ).toBeInTheDocument();

    await openDetails();

    // 率與中位數都算不出來；人次與分母是實際數到的，照實給。
    expect(screen.getByText('這一週').parentElement).toHaveTextContent(
      '—（0 人次）',
    );

    expect(bodyText()).toContain('42 次門診');
  });

  it('點夠多的時候畫得出 8 週折線', () => {
    open();
    expect(screen.getByRole('img', { name: /腸病毒最近 8 週/ })).toBeInTheDocument();
  });
});

/**
 * 過期時抽屜要跟板一樣收起狀態（spec §7）。這兩條 it.each 互為對照：只有
 * false 那一條的話，一個永遠不渲染狀態的抽屜也會過關。
 */
describe('抽屜的資料新舊', () => {
  /** 九個狀態的文案一律從 STATUS_COPY 取，之後多一個狀態這裡自動跟著守。 */
  const LABELS = Object.values(STATUS_COPY).map((entry) => entry.label);
  const STATUSES = Object.keys(CELL_BY_STATUS) as RadarStatus[];

  const drawer = (radarCell: RadarCell, showStatus: boolean) =>
    render(
      <DiseaseDrawer
        disease="腸病毒"
        cell={radarCell}
        data={data()}
        county="台北市"
        age="3~6"
        showStatus={showStatus}
        onClose={noop}
      />,
    );

  it.each(STATUSES)(
    'showStatus 為 false 時 %s 的狀態文案一個都不在畫面上',
    (status) => {
      const view = drawer(CELL_BY_STATUS[status], false);

      LABELS.forEach((label) =>
        expect(screen.queryByText(label)).not.toBeInTheDocument(),
      );

      view.unmount();
    },
  );

  it.each(STATUSES)('showStatus 為 true 時 %s 的狀態文案就在畫面上', (status) => {
    const view = drawer(CELL_BY_STATUS[status], true);

    expect(screen.getByText(STATUS_COPY[status].label)).toBeInTheDocument();
    view.unmount();
  });

  it('收起的只有那一行文字：折線、人次那句話與詳細數字都還在', async () => {
    // spec §7 收的是「可能已經錯的判斷」，折線是數字自己的圖形呈現，不是判斷。
    drawer(cell(), false);
    expect(screen.getByRole('img', { name: /腸病毒最近 8 週/ })).toBeInTheDocument();
    expect(screen.getByText(/這一週有 35 次因腸病毒就診/)).toBeInTheDocument();

    await openDetails();
    const body = bodyText();

    expect(body).toContain('169.0/萬');
    expect(body).toContain('35 人次');
    expect(body).toContain('2,071 次門診');
  });
});

describe('抽屜的語氣', () => {
  it('沒有用到禁用詞', () => {
    BOARD.forEach((disease) => {
      const view = open(disease);
      const body = bodyText();

      FORBIDDEN_WORDS.forEach((word) => expect(body).not.toContain(word));
      view.unmount();
    });
  });

  it('沒有箭頭也沒有驚嘆號', () => {
    open();
    expect(bodyText()).not.toMatch(/[↑↓→←!！⚠]/);
  });

  it('沒有用到全 app 最強的那個紅', () => {
    // 顏色最強只到 butter-dark。primary-dark 用在「比平常多一點」上會讀成急診警報。
    const { container } = open('腸病毒', { ratio: 2.13 });

    expect(container.innerHTML).not.toContain('primary-dark');
    expect(container.innerHTML).not.toContain('text-red');
  });

  it('數字沒有被放大成頭條', async () => {
    open();
    await openDetails();
    const numbers = screen.getByText('統計基數').closest('dl');

    expect(numbers?.innerHTML ?? '').not.toMatch(/text-(lg|xl|2xl|3xl|4xl)/);
  });

  it('className 裡沒有 hex 色碼', () => {
    const { container } = open();

    container.querySelectorAll('[class]').forEach((node) => {
      expect(node.getAttribute('class') ?? '').not.toMatch(/#[0-9a-fA-F]{3,6}/);
    });
  });
});
