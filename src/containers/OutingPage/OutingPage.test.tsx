import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CENTRE_ACCESS,
  CENTRE_ACCESS_UNVERIFIED,
  CENTRE_DATA_ATTRIBUTION,
} from '~app/domain/centreAccess';
import { outingChecklist } from '~app/domain/outingChecklist';
import { savePreferences } from '~app/domain/preferences';
import type { Venue } from '~app/domain/records';
import { restaurants } from '~app/domain/restaurants';
import OutingPage from './OutingPage';

/**
 * LittleOuting 的頁面測試。
 *
 * 這一頁把兩份可信度差很多的資料放在同一個殼裡，所以測試守的主要是「誠實」
 * 而不是「有沒有畫出來」：
 *
 *   - 名冊載不進來時要說載不進來，不能畫成「這個縣市沒有親子館」；
 *   - 只有查證過的縣市才顯示規則，沒查證的顯示 CENTRE_ACCESS_UNVERIFIED，
 *     絕不拿隔壁縣市的規則頂替；
 *   - 餐廳那一頁必須自己說「這是精選，不是完整名單」，親子館那一頁不能說；
 *   - 政府開放資料的來源標示必須渲染——沒標示等於自始未取得授權。
 *
 * 篩選與搜尋也在這裡守：搜尋刻意同時看區名與地址，因為家長記得的常常是路名
 * 或區名而不是館名，這個行為只要有人「順手簡化成只搜 name」就會靜靜消失。
 */

/**
 * 固定的名冊樣本。城市取自 OutingPage 的 CITY_ORDER，否則縣市籌碼不會出現。
 * 臺北市在 CENTRE_ACCESS 裡查證過，雲林縣沒有——兩者都要有，才測得出
 * 「查不到就說查不到」。
 */
const CENTRES: Venue[] = [
  {
    id: 'c-tpe-shilin',
    kind: 'centre',
    name: '芝山親子館',
    city: '臺北市',
    district: '士林區',
    address: '臺北市士林區克強路 28 號 1 樓',
    tags: ['free'],
    sourceUrl: 'https://example.gov.tw/centre/1',
    verifiedOn: '2026-08-28',
  },
  {
    id: 'c-tpe-datong',
    kind: 'centre',
    name: '延平親子館',
    city: '臺北市',
    // 地址刻意不含行政區：名冊裡的地址格式並不一致，district 才是可靠的那一欄，
    // 用這一筆才驗得出搜尋真的有看 district，而不是碰巧在地址裡撞到。
    district: '大同區',
    address: '臺北市承德路四段 168 號',
    tags: ['free'],
    sourceUrl: 'https://example.gov.tw/centre/2',
    verifiedOn: '2026-08-28',
  },
  {
    id: 'c-ylin-douliu',
    kind: 'centre',
    name: '斗六親子館',
    city: '雲林縣',
    district: '斗六市',
    address: '雲林縣斗六市府文路 22 號',
    tags: ['free'],
    sourceUrl: 'https://example.gov.tw/centre/3',
    verifiedOn: '2026-08-28',
  },
  {
    id: 'c-ylin-huwei',
    kind: 'centre',
    name: '虎尾親子館',
    city: '雲林縣',
    district: '虎尾鎮',
    address: '雲林縣虎尾鎮公安路 213 號',
    tags: ['free'],
    sourceUrl: 'https://example.gov.tw/centre/4',
    verifiedOn: '2026-08-28',
  },
];

/** 查證過的縣市 vs 沒查證的縣市，兩者都取自真實資料而不是自己編的。 */
const VERIFIED_CITY = '臺北市';
const UNVERIFIED_CITY = '雲林縣';

/** UI 一次最多畫 30 張卡；要跨過上限才測得到截斷與「還有 N 處」。 */
const MAX_RENDERED = 30;

const manyCentres = (count: number): Venue[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `c-bulk-${i}`,
    kind: 'centre' as const,
    name: `雲林第 ${i} 親子館`,
    city: '雲林縣',
    district: '斗六市',
    address: `雲林縣斗六市府文路 ${i} 號`,
    tags: ['free' as const],
    sourceUrl: `https://example.gov.tw/bulk/${i}`,
    verifiedOn: '2026-08-28',
  }));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** 掛載並等名冊進來；回傳值是 userEvent instance，測試接著就能操作。 */
async function renderLoaded(rows: Venue[] = CENTRES) {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => rows });
  const user = userEvent.setup();

  render(<OutingPage />);
  await screen.findByText(new RegExp(`共 ${rows.length} 處`));

  return user;
}

const mapLinks = () => screen.queryAllByRole('link', { name: /地圖與導航/ });

const cityChip = (name: string) => screen.getByRole('button', { name });

describe('親子館名冊載入', () => {
  it('載入失敗時說載入失敗，而不是畫成一片「找不到符合的場地」', async () => {
    // 這兩句對家長的意思完全不同：一個是「重整看看」，另一個是「這裡沒有館」。
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => [] });
    render(<OutingPage />);

    expect(await screen.findByText('親子館資料載入失敗')).toBeInTheDocument();
    expect(screen.queryByText('找不到符合的場地')).not.toBeInTheDocument();
    expect(mapLinks()).toEqual([]);
  });

  it('載入成功就把場館畫出來', async () => {
    await renderLoaded();

    expect(screen.getByRole('heading', { name: '芝山親子館' })).toBeInTheDocument();
    expect(mapLinks()).toHaveLength(CENTRES.length);
    expect(screen.queryByText('親子館資料載入失敗')).not.toBeInTheDocument();
  });
});

describe('縣市篩選', () => {
  it('選了縣市就只留該縣市，切回全部縣市會還原', async () => {
    const user = await renderLoaded();

    await user.click(cityChip(VERIFIED_CITY));
    expect(screen.getByRole('heading', { name: '芝山親子館' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '延平親子館' })).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: '斗六親子館' }),
    ).not.toBeInTheDocument();

    expect(mapLinks()).toHaveLength(2);

    await user.click(cityChip('全部縣市'));
    expect(screen.getByRole('heading', { name: '斗六親子館' })).toBeInTheDocument();
    expect(mapLinks()).toHaveLength(CENTRES.length);
  });

  it('只列出資料裡真的有的縣市', async () => {
    await renderLoaded();

    expect(cityChip(VERIFIED_CITY)).toBeInTheDocument();
    expect(cityChip(UNVERIFIED_CITY)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '澎湖縣' })).not.toBeInTheDocument();
  });
});

describe('搜尋', () => {
  it('用區名搜得到館名不含該區名的場館', async () => {
    // 家長記得的常常是「大同區那間」，不是館名。只搜 name 會什麼都找不到。
    const user = await renderLoaded();

    await user.type(screen.getByRole('searchbox'), '大同');

    expect(screen.getByRole('heading', { name: '延平親子館' })).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: '芝山親子館' }),
    ).not.toBeInTheDocument();

    expect(mapLinks()).toHaveLength(1);
  });

  it('用路名搜得到館名不含該路名的場館', async () => {
    const user = await renderLoaded();

    await user.type(screen.getByRole('searchbox'), '克強');

    expect(screen.getByRole('heading', { name: '芝山親子館' })).toBeInTheDocument();
    expect(mapLinks()).toHaveLength(1);
  });

  it('搜不到就說搜不到', async () => {
    const user = await renderLoaded();

    await user.type(screen.getByRole('searchbox'), '不存在的地名');

    expect(screen.getByText('找不到符合的場地')).toBeInTheDocument();
  });
});

describe('各縣市使用規則', () => {
  it('查證過的縣市把費用、年齡、預約、戶籍四件事講清楚', async () => {
    const user = await renderLoaded();
    const rules = CENTRE_ACCESS[VERIFIED_CITY];

    await user.click(cityChip(VERIFIED_CITY));

    expect(
      screen.getByRole('heading', { name: `${VERIFIED_CITY}的使用規則` }),
    ).toBeInTheDocument();

    for (const label of ['費用', '年齡對象', '預約方式', '戶籍限制']) {
      expect(screen.getByText(label), label).toBeInTheDocument();
    }

    expect(screen.getByText(rules.fee.value)).toBeInTheDocument();
    expect(screen.getByText(rules.ageLimit.value)).toBeInTheDocument();
    expect(screen.getByText(rules.booking.value)).toBeInTheDocument();
    expect(screen.getByText(rules.residency.value)).toBeInTheDocument();
  });

  it('沒查證過的縣市說沒查證，不會借用別的縣市的規則', async () => {
    const user = await renderLoaded();

    expect(CENTRE_ACCESS[UNVERIFIED_CITY]).toBeUndefined();
    await user.click(cityChip(UNVERIFIED_CITY));

    expect(screen.getByText(CENTRE_ACCESS_UNVERIFIED)).toBeInTheDocument();

    expect(
      screen.queryByText(CENTRE_ACCESS[VERIFIED_CITY].fee.value),
    ).not.toBeInTheDocument();

    expect(screen.queryByText('費用')).not.toBeInTheDocument();
  });

  it('停在全部縣市時不顯示任何縣市規則', async () => {
    await renderLoaded();

    expect(screen.queryByText(/的使用規則/)).not.toBeInTheDocument();
    expect(screen.queryByText(CENTRE_ACCESS_UNVERIFIED)).not.toBeInTheDocument();
  });
});

describe('兩種資料的可信度差別', () => {
  it('餐廳分頁自己說這是精選不是完整名單', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: '親子餐廳' }));

    expect(
      await screen.findByRole('heading', { name: '這是精選，不是完整名單' }),
    ).toBeInTheDocument();
  });

  it('親子館分頁不掛那句話——名冊是齊全的，不該自貶', async () => {
    await renderLoaded();

    expect(
      screen.queryByRole('heading', { name: '這是精選，不是完整名單' }),
    ).not.toBeInTheDocument();
  });

  it('親子館分頁逐字顯示政府開放資料的來源標示', async () => {
    // 政府資料開放授權條款第 1 版：未依格式標示者視為自始未取得授權。
    await renderLoaded();

    expect(screen.getByText(CENTRE_DATA_ATTRIBUTION)).toBeInTheDocument();
  });

  it('餐廳分頁不掛親子館的來源標示', async () => {
    // 那 12 筆來自部落格與媒體，借政府名冊的權威感就是誤導。
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: '親子餐廳' }));
    await screen.findByRole('heading', { name: '這是精選，不是完整名單' });

    expect(screen.queryByText(CENTRE_DATA_ATTRIBUTION)).not.toBeInTheDocument();
  });
});

describe('切換分頁時的篩選狀態', () => {
  it('切到親子餐廳時把縣市切回全部縣市', async () => {
    // 餐廳只在 6 個縣市有，而被選中的那顆縣市籌碼在餐廳這一頁根本畫不出來：
    // 留著親子館選的縣市，22 縣市裡有 16 個只會看到「找不到符合的場地」，
    // 家長也看不出是什麼在篩。
    const user = await renderLoaded();

    await user.click(cityChip(UNVERIFIED_CITY));
    expect(cityChip(UNVERIFIED_CITY)).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '親子餐廳' }));
    await screen.findByRole('heading', { name: '這是精選，不是完整名單' });

    expect(cityChip('全部縣市')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('找不到符合的場地')).not.toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(`共 ${restaurants.length} 處`)),
    ).toBeInTheDocument();
  });

  it('搜尋框有自己的標籤，切分頁時跟著換——placeholder 不是標籤', async () => {
    const user = await renderLoaded();

    expect(
      screen.getByRole('searchbox', { name: '搜尋親子館' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '親子餐廳' }));
    await screen.findByRole('heading', { name: '這是精選，不是完整名單' });

    expect(
      screen.getByRole('searchbox', { name: '搜尋親子餐廳' }),
    ).toBeInTheDocument();
  });
});

/**
 * 記住上次停在哪。
 *
 * 家長帶孩子出門會回到同一頁看同一個縣市；搜尋字串刻意不記，那是一次性的問句，
 * 不是「我家在哪」。
 */
describe('記住上次的分頁與縣市', () => {
  /*
    重新整理：卸載再掛一次，只有記在裝置上的東西活得下來。不能用 renderLoaded
    等「共 N 處」——記著的縣市會篩掉幾筆，數字對不上；只等它有數字就好。
  */
  const reload = async () => {
    cleanup();

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => CENTRES,
    });

    const user = userEvent.setup();

    render(<OutingPage />);
    await screen.findByText(/共 \d+ 處/);

    return user;
  };

  it('選了縣市，重新整理之後還是那個縣市', async () => {
    const user = await renderLoaded();

    await user.click(cityChip(UNVERIFIED_CITY));

    await reload();

    expect(cityChip(UNVERIFIED_CITY)).toHaveAttribute('aria-pressed', 'true');
    expect(cityChip('全部縣市')).toHaveAttribute('aria-pressed', 'false');
  });

  it('停在親子餐廳那一頁，重新整理之後還在親子餐廳', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: '親子餐廳' }));
    await screen.findByRole('heading', { name: '這是精選，不是完整名單' });

    cleanup();

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => CENTRES,
    });

    render(<OutingPage />);

    expect(
      await screen.findByRole('heading', { name: '這是精選，不是完整名單' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '親子餐廳' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('停在出發前那一頁也記得住', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: '出發前' }));

    cleanup();

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => CENTRES,
    });

    render(<OutingPage />);

    expect(
      await screen.findByRole('heading', { name: outingChecklist[0].question }),
    ).toBeInTheDocument();
  });

  it('記下來的縣市不在這一頁的名冊裡時，當成全部縣市', async () => {
    // 餐廳只有 6 個縣市有，上游也可能改字。留著對不上的那個縣市，家長會拿到
    // 一張空清單，而那顆被選中的籌碼根本畫不出來，看不出是什麼在篩。
    savePreferences({ outingCity: '不存在市' });
    await renderLoaded();

    expect(cityChip('全部縣市')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('找不到符合的場地')).not.toBeInTheDocument();
  });

  it('清掉裝置上的資料就回到原本的行為：親子館、全部縣市', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: '親子餐廳' }));
    await screen.findByRole('heading', { name: '這是精選，不是完整名單' });

    localStorage.clear();
    await reload();

    expect(screen.getByRole('button', { name: '親子館' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(cityChip('全部縣市')).toHaveAttribute('aria-pressed', 'true');
  });

  it('搜尋字串不記——那是一次性的問句', async () => {
    const user = await renderLoaded();

    await user.type(screen.getByRole('searchbox', { name: '搜尋親子館' }), '芝山');

    await reload();

    expect(screen.getByRole('searchbox', { name: '搜尋親子館' })).toHaveValue('');
  });
});

describe('名冊載入中', () => {
  it('還在載入時不報「共 0 處」，也不說找不到場地', async () => {
    // 118 KB 的名冊到之前就先講「找不到符合的場地」，等於用失敗的說法回答一個
    // 還沒問完的問題。
    let deliver: (rows: Venue[]) => void = () => {};

    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        deliver = (rows) =>
          resolve({ ok: true, status: 200, json: async () => rows });
      }),
    );

    render(<OutingPage />);

    expect(screen.getByText('正在載入親子館名冊…')).toBeInTheDocument();
    expect(screen.queryByText(/共 \d+ 處/)).not.toBeInTheDocument();
    expect(screen.queryByText('找不到符合的場地')).not.toBeInTheDocument();

    deliver(CENTRES);

    expect(
      await screen.findByText(new RegExp(`共 ${CENTRES.length} 處`)),
    ).toBeInTheDocument();

    expect(screen.queryByText('正在載入親子館名冊…')).not.toBeInTheDocument();
  });
});

describe('渲染上限', () => {
  it('超過上限就截斷，並誠實說還有幾處沒畫', async () => {
    const rows = manyCentres(MAX_RENDERED + 5);

    await renderLoaded(rows);

    expect(mapLinks()).toHaveLength(MAX_RENDERED);
    expect(screen.getByText(/還有 5 處/)).toBeInTheDocument();

    expect(
      screen.getByText(
        new RegExp(`共 ${rows.length} 處，先顯示 ${MAX_RENDERED} 處`),
      ),
    ).toBeInTheDocument();
  });

  it('沒超過上限就不出現截斷提示', async () => {
    await renderLoaded();

    expect(screen.queryByText(/還有 \d+ 處/)).not.toBeInTheDocument();
    expect(screen.queryByText(/先顯示/)).not.toBeInTheDocument();
  });
});

describe('出發前檢查清單', () => {
  it('每一項都畫出來', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: '出發前' }));

    await screen.findByText(outingChecklist[0].question);

    for (const item of outingChecklist) {
      expect(screen.getByText(item.question), item.id).toBeInTheDocument();
      expect(screen.getByText(item.why), item.id).toBeInTheDocument();
    }
  });
});
