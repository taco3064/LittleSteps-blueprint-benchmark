import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DISEASE_PART_OF } from '~app/domain/diseases';
import { savePreferences } from '~app/domain/preferences';
import { STATUS_COPY } from '~app/domain/radar';
import type { ChildProfile, RadarCell, RadarData } from '~app/domain/records';
import RadarPage from './RadarPage';

/*
  這一頁只從孩子身上讀一件事：生日，用來決定年齡層的預設值。真正的 provider
  要 Firebase，而未登入的 store 永遠拿不到孩子，所以把 hook 換掉是唯一的接縫。
*/
const { childStore } = vi.hoisted(() => ({
  childStore: { current: null as { currentChild: ChildProfile } | null },
}));

vi.mock('~app/hooks/useChildStoreContext', () => ({
  useOptionalChildStore: () => childStore.current,
}));

/**
 * 一份最小的寶寶檔案。姓名與 id 刻意給得認得出來：那樣才驗得出它們沒有被寫進
 * 裝置。
 */
function child(birthday: string): ChildProfile {
  return {
    id: 'c-9c1f7a44',
    name: '小明',
    birthday,
    milestoneProgress: {},
    vaccineProgress: {},
    createdAt: '2022-03-14T00:00:00.000Z',
    createdBy: 'u-9f3c2e1a',
    members: { 'u-9f3c2e1a': true },
  };
}

function cell(overrides: Partial<RadarCell> = {}): RadarCell {
  return {
    rate: 100,
    trendBase: 100,
    ratio: 1,
    geoRatio: 1,
    visits: 20,
    denom: 2000,
    reliability: 'ok',
    spark: [10, 20, 30, 40, 50, 60, 70, 100],
    ...overrides,
  };
}

const DISEASES = ['腸病毒', '手足口病', '疱疹性咽峽炎', '類流感', '腹瀉', '水痘'];

/** 板上那四列：上游六支 dataset 減掉收在腸病毒底下的兩種表現。 */
const BOARD = DISEASES.filter((name) => !(name in DISEASE_PART_OF));

/** 九個狀態的文案，從 STATUS_COPY 取——之後多一個狀態，這裡自動跟著守。 */
const STATUS_LABELS = Object.values(STATUS_COPY).map((entry) => entry.label);

const perDisease = (
  factory: (name: string) => RadarCell,
): Record<string, RadarCell> =>
  Object.fromEntries(DISEASES.map((name) => [name, factory(name)]));

/** 全國那一層只有 rate，不是完整的 RadarCell（src/types/index.ts:731）。 */
const nationalBand = (): Record<string, { rate: number | null }> =>
  Object.fromEntries(DISEASES.map((name) => [name, { rate: 100 }]));

/**
 * 刻意不放台北市：RadarPage 的預設縣市是台北市，這份 fixture 就順便守住
 * 「預設縣市不在資料裡時退到第一個縣市，而不是整頁變成錯誤畫面」。
 */
function fixture(weekStart = '2026-08-23', weekEnd = '2026-08-29'): RadarData {
  return {
    week: '2026-W34',
    weekStart,
    weekEnd,
    generatedAt: '2026-09-03T01:00:00.000Z',
    verifiedOn: '2026-09-03',
    source: '衛生福利部疾病管制署 健保門診及住院就診人次統計',
    sourceUrls: DISEASES.map((_, i) => `https://od.cdc.gov.tw/eic/NHI_${i}.csv`),
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
    national: {
      '0~2': nationalBand(),
      '3~6': nationalBand(),
      '7~12': nationalBand(),
    },
    counties: {
      花蓮縣: {
        '0~2': perDisease(() => cell()),
        // 腸病毒 ratio 2.13 → 最近變多；水痘基線為零 → 最近沒有個案
        '3~6': perDisease((name) =>
          name === '腸病毒'
            ? cell({ rate: 169, trendBase: 79.4, ratio: 2.13, visits: 35 })
            : name === '水痘'
              ? cell({ rate: 0, trendBase: 0, ratio: null, visits: 0 })
              : cell(),
        ),
        '7~12': perDisease(() => cell()),
      },
      連江縣: {
        '0~2': perDisease(() =>
          cell({
            rate: null,
            trendBase: null,
            ratio: null,
            visits: 0,
            denom: 11,
            reliability: 'insufficient',
          }),
        ),
        '3~6': perDisease(() => cell({ denom: 500, reliability: 'small' })),
        '7~12': perDisease(() => cell()),
      },
    },
  };
}

function mockFetch(data: RadarData | null) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      data
        ? Promise.resolve({ ok: true, json: () => Promise.resolve(data) })
        : Promise.resolve({ ok: false, status: 404 }),
    ),
  );
}

/** 板上的四列，照 DOM 順序。 */
const renderedDiseases = () =>
  screen
    .getAllByRole('button')
    .map((button) =>
      BOARD.find((name) => (button.textContent ?? '').startsWith(name)),
    )
    .filter((name): name is string => name !== undefined);

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

async function renderReady(data: RadarData = fixture()) {
  mockFetch(data);
  render(<RadarPage />);
  await waitFor(() => expect(screen.getByText('腸病毒')).toBeInTheDocument());

  return user();
}

/** 重新整理：卸載再掛一次，只有記在裝置上的東西活得下來。 */
async function reload(data: RadarData) {
  cleanup();

  return renderReady(data);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-09-03T00:00:00Z'));
  childStore.current = null;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('標題列', () => {
  it('給得出回到入口頁的路，資料抓不到時也給得出', async () => {
    // 入口頁是唯一列出六個服務的地方，而沒有子應用會連到自己的手足：少了這顆
    // 鈕，家長只剩瀏覽器的上一頁可以離開這一頁。這個服務上線時就漏了。
    await renderReady();
    expect(screen.getByRole('button', { name: '所有服務' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '帳號與寶寶' })).toBeInTheDocument();
  });

  it('抓不到資料的畫面也留著「所有服務」那顆', async () => {
    mockFetch(null);
    render(<RadarPage />);

    await waitFor(() =>
      expect(screen.getByText('現在抓不到資料')).toBeInTheDocument(),
    );

    expect(screen.getByRole('button', { name: '所有服務' })).toBeInTheDocument();
  });
});

describe('疫情雷達板', () => {
  it('四列都在，順序固定不隨狀態重排', async () => {
    // 水痘（清單最後一個）最吵、腸病毒（第一個）最安靜。若有人把「變多」的
    // 排到最前面，這一條就會爆：那會讓每次打開都像在看壞消息排行榜。
    const data = fixture();

    data.counties['花蓮縣']['0~2'] = perDisease((name) =>
      name === '水痘'
        ? cell({ rate: 169, trendBase: 79.4, ratio: 2.13, visits: 35 })
        : name === '腸病毒'
          ? cell({ rate: 40, trendBase: 100, ratio: 0.4 })
          : cell(),
    );

    await renderReady(data);
    expect(renderedDiseases()).toEqual(BOARD);
    expect(screen.getByText('最近變多，多留意')).toBeInTheDocument();
  });

  it('腸病毒只佔一列，兩種表現寫在它自己底下', async () => {
    // 上游腸病毒那一支就是手足口病加疱疹性咽峽炎；三列並排等於把同一批就診人
    // 次數三次。收起來之後，那兩個名字還是要看得到，否則家長會以為漏了。
    await renderReady();
    expect(renderedDiseases()).toHaveLength(4);
    expect(screen.queryByText('手足口病')).not.toBeInTheDocument();
    expect(screen.getByText('含手足口病、疱疹性咽峽炎')).toBeInTheDocument();
  });

  it('板下面說清楚右邊那個數字是什麼', async () => {
    await renderReady();

    expect(
      screen.getByText(/右邊的人次是這一週該縣市、該年齡層的健保門診就診次數/),
    ).toBeInTheDocument();
  });

  it('顯示疫情週的日期區間而不是週號', async () => {
    await renderReady();
    expect(screen.getByText(/8\/23–8\/29/)).toBeInTheDocument();
    expect(screen.queryByText(/第 ?34 ?週/)).not.toBeInTheDocument();
    expect(document.body.textContent ?? '').not.toContain('2026-W34');
  });

  it('資料還沒到時說在載入，不會先端出一塊空板', () => {
    // 永遠不 settle。用 executor 形式而不是 Promise.withResolvers，因為
    // tsconfig 的 lib 停在 ES2020（比照 BabyOasisPage.test.tsx:121）。
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    render(<RadarPage />);
    expect(screen.getByText('載入中')).toBeInTheDocument();
    expect(screen.queryByText('腸病毒')).not.toBeInTheDocument();
    expect(screen.queryByText(/現在抓不到資料/)).not.toBeInTheDocument();
  });
});

describe('怎麼看這個板', () => {
  it('第一次打開就有一段話說明這些數字是什麼', async () => {
    await renderReady();

    expect(
      screen.getByRole('heading', { name: '怎麼看這個板' }),
    ).toBeInTheDocument();

    expect(screen.getByText(/選你住的縣市和孩子的年齡/)).toBeInTheDocument();
  });

  it('說明在縣市籤之前——先知道自己在看什麼，再選縣市', async () => {
    await renderReady();
    const body = document.body.textContent ?? '';

    expect(body.indexOf('怎麼看這個板')).toBeGreaterThan(-1);
    expect(body.indexOf('怎麼看這個板')).toBeLessThan(body.indexOf('花蓮縣'));
  });
});

describe('一句話總結', () => {
  it('有病種比平常多就點名，不用家長自己讀四列', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: '3-6 歲' }));

    expect(
      screen.getByText('這一週腸病毒比平常多，其他沒有變多。'),
    ).toBeInTheDocument();
  });

  it('沒事的那一週也把話說完整，不是留白', async () => {
    await renderReady();
    expect(screen.getByText('這一週沒有哪一種比平常明顯多。')).toBeInTheDocument();
  });

  it('整塊板都比不出來的時候不給安心的那句話', async () => {
    // 連江縣 0-2 歲四列都是「資料不足」，這一行就得跟著承認。
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: '連江縣' }));
    expect(screen.getAllByText('資料不足').length).toBe(4);
    expect(screen.queryByText(/沒有哪一種比平常明顯多/)).not.toBeInTheDocument();

    expect(
      screen.getByText('這一週的資料還不夠，比不出這幾種病最近多還是少。'),
    ).toBeInTheDocument();
  });

  it('資料過期就不給這句話——它跟狀態一樣是撐不起來的判斷', async () => {
    await renderReady(fixture('2026-06-28', '2026-07-04'));
    expect(screen.queryByText(/沒有哪一種比平常明顯多/)).not.toBeInTheDocument();
    expect(screen.queryByText(/比平常多，其他沒有變多/)).not.toBeInTheDocument();
  });
});

describe('縣市與年齡層', () => {
  it('預設看台北市', async () => {
    const data = fixture();

    data.counties['台北市'] = data.counties['花蓮縣'];
    await renderReady(data);
    expect(screen.getByRole('button', { name: '台北市' })).toHaveClass('chip-on');

    expect(screen.getByRole('button', { name: '花蓮縣' })).not.toHaveClass(
      'chip-on',
    );
  });

  it('資料裡沒有預設縣市時退到第一個縣市，而不是整頁錯誤', async () => {
    // fixture 只有花蓮縣與連江縣。上游哪天把「台北市」改成「臺北市」，家長看到
    // 的應該是別的縣市的板，不是一片「現在抓不到資料」。
    await renderReady();
    expect(screen.getByRole('button', { name: '花蓮縣' })).toHaveClass('chip-on');
    expect(screen.queryByText(/現在抓不到資料/)).not.toBeInTheDocument();
  });

  it('切換年齡層會換掉狀態文案', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: '3-6 歲' }));
    expect(screen.getByText('最近變多，多留意')).toBeInTheDocument();
    expect(screen.getByText('最近沒有個案')).toBeInTheDocument();
  });

  it('切換縣市會換掉整塊板', async () => {
    const it = await renderReady();

    expect(screen.getAllByText('跟平常差不多').length).toBe(4);
    await it.click(screen.getByRole('button', { name: '連江縣' }));
    expect(screen.queryByText('跟平常差不多')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '連江縣' })).toHaveClass('chip-on');
  });

  it('三個年齡層都選得到，選中的那顆標出來', async () => {
    const it = await renderReady();

    ['0-2 歲', '3-6 歲', '7-12 歲'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '0-2 歲' })).toHaveClass('chip-on');
    await it.click(screen.getByRole('button', { name: '7-12 歲' }));
    expect(screen.getByRole('button', { name: '7-12 歲' })).toHaveClass('chip-on');

    expect(screen.getByRole('button', { name: '0-2 歲' })).not.toHaveClass(
      'chip-on',
    );
  });

  it('樣本偏小與資料不足都據實顯示', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: '連江縣' }));
    expect(screen.getAllByText('資料不足').length).toBe(4);
    await it.click(screen.getByRole('button', { name: '3-6 歲' }));
    expect(screen.getAllByText('樣本偏小，僅供參考').length).toBe(4);
  });
});

/**
 * 記住上次的選擇。
 *
 * 這一頁是每週的習慣：住高雄、孩子四歲的家長，過去每一週打開都得先點兩顆籌碼
 * 才讀得到自己要的那塊板，一年五十二次。
 *
 * 年齡層的優先順序是刻意的：孩子的生日 > 上次點的 > 預設。生日贏過上次點的，
 * 因為孩子的年齡是更好的答案而且它自己會變；但這一頁完全公開，多數訪客根本沒
 * 有寶寶檔案，所以「上次點的」那一段必須能單獨成立。
 */
describe('記住上次選的縣市與年齡層', () => {
  /** fixture 沒有高雄市，補一份和花蓮縣一樣的板進去。 */
  const withKaohsiung = () => {
    const data = fixture();

    data.counties['高雄市'] = data.counties['花蓮縣'];

    return data;
  };

  it('選了高雄市和 3-6 歲，重新整理之後還是高雄市和 3-6 歲', async () => {
    const data = withKaohsiung();
    const it = await renderReady(data);

    await it.click(screen.getByRole('button', { name: '高雄市' }));
    await it.click(screen.getByRole('button', { name: '3-6 歲' }));

    await reload(data);

    expect(screen.getByRole('button', { name: '高雄市' })).toHaveClass('chip-on');
    expect(screen.getByRole('button', { name: '3-6 歲' })).toHaveClass('chip-on');
  });

  it('清掉裝置上的資料就回到原本的行為', async () => {
    const data = withKaohsiung();
    const it = await renderReady(data);

    await it.click(screen.getByRole('button', { name: '高雄市' }));
    await it.click(screen.getByRole('button', { name: '7-12 歲' }));

    localStorage.clear();
    await reload(data);

    expect(screen.getByRole('button', { name: '花蓮縣' })).toHaveClass('chip-on');
    expect(screen.getByRole('button', { name: '0-2 歲' })).toHaveClass('chip-on');
  });

  it('記下來的縣市不在資料裡時，退得和預設值一樣，不出錯誤畫面', async () => {
    // 上游哪天把縣市改個字，或家長換了資料版本：記著的那個縣市可能整個消失。
    savePreferences({ guardCounty: '不存在市' });
    await renderReady();

    expect(screen.getByRole('button', { name: '花蓮縣' })).toHaveClass('chip-on');
    expect(screen.queryByText(/現在抓不到資料/)).not.toBeInTheDocument();
  });

  it('記下來的年齡層不在資料裡時，退回預設值，不出錯誤畫面', async () => {
    // 這一段比縣市更要緊：對不上的年齡層會讓 cells 變成 undefined，整頁就成了
    // 「現在抓不到資料」——被一個上次的點擊弄壞。
    savePreferences({ guardAgeBand: '13~18' });
    await renderReady();

    expect(screen.getByRole('button', { name: '0-2 歲' })).toHaveClass('chip-on');
    expect(screen.queryByText(/現在抓不到資料/)).not.toBeInTheDocument();
  });

  it('未登入時，上次點的年齡層贏過預設值', async () => {
    savePreferences({ guardAgeBand: '7~12' });
    await renderReady();

    expect(screen.getByRole('button', { name: '7-12 歲' })).toHaveClass('chip-on');
  });

  it('登入且孩子四歲時，不必點就停在 3-6 歲', async () => {
    childStore.current = { currentChild: child('2022-03-14') };
    await renderReady();

    expect(screen.getByRole('button', { name: '3-6 歲' })).toHaveClass('chip-on');

    expect(screen.getByRole('button', { name: '0-2 歲' })).not.toHaveClass(
      'chip-on',
    );
  });

  it('孩子的生日贏過上次點的年齡層', async () => {
    // 家長上次點了 0-2 歲，孩子今年四歲。孩子的年齡是更好的答案，而且它自己
    // 會變——這是刻意的，不是把上次的選擇弄丟了。
    savePreferences({ guardAgeBand: '0~2' });
    childStore.current = { currentChild: child('2022-03-14') };
    await renderReady();

    expect(screen.getByRole('button', { name: '3-6 歲' })).toHaveClass('chip-on');
  });

  it('這次點的年齡層贏過孩子的生日——那是家長剛剛的動作', async () => {
    childStore.current = { currentChild: child('2022-03-14') };
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: '0-2 歲' }));

    expect(screen.getByRole('button', { name: '0-2 歲' })).toHaveClass('chip-on');

    expect(screen.getByRole('button', { name: '3-6 歲' })).not.toHaveClass(
      'chip-on',
    );
  });

  it('點了已經選中的那一顆年齡層，這一頁還是跟著孩子走', async () => {
    // 那一下畫面上什麼都沒變，所以它不該把年齡層釘住。少了這一道，家長之後換
    // 一個孩子就不再重推，而畫面上沒有任何線索可以發現。點「別的」那一顆不管
    // 有沒有這一道都會過（上一個案例守的就是那個釘住），所以這裡點的必須是已
    // 經選中的那一顆。
    childStore.current = { currentChild: child('2022-03-14') };
    mockFetch(fixture());
    const view = render(<RadarPage />);

    await waitFor(() => expect(screen.getByText('腸病毒')).toBeInTheDocument());

    // 這裡看 aria-pressed 而不是 chip-on：被選中是控制項的狀態，chip-on 只是
    // 它現在長什麼樣。
    expect(screen.getByRole('button', { name: '3-6 歲' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user().click(screen.getByRole('button', { name: '3-6 歲' }));

    expect(screen.getByRole('button', { name: '3-6 歲' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // 這一頁沒有自己的切換器，孩子是從 store 下來的。換掉再 render 一次，就是
    // 家長在別的地方切了寶寶之後這一頁看到的樣子——它不會卸載。
    childStore.current = { currentChild: child('2019-03-14') };
    view.rerender(<RadarPage />);

    expect(screen.getByRole('button', { name: '7-12 歲' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(screen.getByRole('button', { name: '3-6 歲' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('孕期檔案不參與推論，年齡層留給上次點的', async () => {
    savePreferences({ guardAgeBand: '7~12' });

    childStore.current = {
      currentChild: { ...child('2026-12-01'), isPregnancy: true, name: '寶寶' },
    };

    await renderReady();

    expect(screen.getByRole('button', { name: '7-12 歲' })).toHaveClass('chip-on');
  });

  it('裝置上不會留下孩子的姓名、生日或 id', async () => {
    // 這是這個模組存在的理由所守的那條線：孩子的紀錄在登入之後才拿得到，而
    // localStorage 既不需要登入，登出也不會清掉。畫面上顯示的 3-6 歲是從生日
    // 推出來的，所以連它都不寫——能重算的東西存起來只會變成過期的值。
    const data = withKaohsiung();

    childStore.current = { currentChild: child('2022-03-14') };
    const it = await renderReady(data);

    await it.click(screen.getByRole('button', { name: '高雄市' }));

    const dump = Object.entries(localStorage)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    expect(dump).toContain('高雄市');

    for (const secret of ['小明', '2022-03-14', 'c-9c1f7a44', 'u-9f3c2e1a']) {
      expect(dump).not.toContain(secret);
    }

    expect(dump).not.toContain('3~6');
  });
});

describe('資料新舊', () => {
  it('一週前的資料照常顯示，不加任何但書', async () => {
    await renderReady();
    expect(screen.queryByText(/有點舊了/)).not.toBeInTheDocument();
    expect(screen.queryByText(/超過一個月沒更新/)).not.toBeInTheDocument();
    expect(screen.getAllByText('跟平常差不多').length).toBe(4);
  });

  it('兩週以上沒更新就說一聲，但板照常顯示', async () => {
    await renderReady(fixture('2026-08-09', '2026-08-15'));
    expect(screen.getByText(/有點舊了/)).toBeInTheDocument();
    // 加一行但書而已，狀態與數字都還在。
    expect(screen.getAllByText('跟平常差不多').length).toBe(4);
    expect(renderedDiseases()).toEqual(BOARD);
  });

  it('資料超過一個月就收起狀態，只留數字', async () => {
    await renderReady(fixture('2026-06-28', '2026-07-04'));
    expect(screen.getByText(/超過一個月沒更新/)).toBeInTheDocument();
    expect(screen.queryByText('跟平常差不多')).not.toBeInTheDocument();
    // 數字還在，四列也還在——收起的是可能已經錯的判斷，不是整塊板。
    expect(renderedDiseases()).toEqual(BOARD);
    expect(screen.getAllByText('20 人次').length).toBe(4);
  });

  it('過期時抽屜裡也不顯示狀態，板收了抽屜就得跟著收', async () => {
    // 分層一致性的回歸：板收了、抽屜沒收的話，家長從板上看不到判斷，點進去卻
    // 又看到一個可能已經錯的，比不收更糟。
    const it = await renderReady(fixture('2026-06-28', '2026-07-04'));

    await it.click(screen.getByRole('button', { name: /腸病毒/ }));
    const dialog = screen.getByRole('dialog');

    STATUS_LABELS.forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
      expect(dialog).not.toHaveTextContent(label);
    });

    // 收起的是判斷，不是數字：那句話、率、分母照給，也還連得出疾管署那一頁。
    expect(dialog).toHaveTextContent('這一週有 20 次因腸病毒就診');
    await it.click(screen.getByRole('button', { name: '詳細數字' }));
    expect(dialog).toHaveTextContent('100.0/萬');
    expect(dialog).toHaveTextContent('2,000 次門診');

    expect(
      screen.getByRole('link', { name: /疾管署的腸病毒說明/ }),
    ).toBeInTheDocument();
  });

  it('過期時給得出去哪裡看最新的', async () => {
    await renderReady(fixture('2026-06-28', '2026-07-04'));

    expect(screen.getByRole('link', { name: '疾管署' })).toHaveAttribute(
      'href',
      'https://nidss.cdc.gov.tw/',
    );
  });
});

describe('抓不到資料', () => {
  it('抓不到資料時給得出下一步，不是空白', async () => {
    mockFetch(null);
    render(<RadarPage />);

    await waitFor(() =>
      expect(screen.getByText(/現在抓不到資料/)).toBeInTheDocument(),
    );

    expect(screen.queryByText('腸病毒')).not.toBeInTheDocument();
  });

  it('那個下一步真的連得到疾管署', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    mockFetch(null);
    render(<RadarPage />);
    const action = await screen.findByRole('button', { name: '前往疾管署' });

    await user().click(action);

    expect(open).toHaveBeenCalledWith(
      'https://nidss.cdc.gov.tw/',
      '_blank',
      'noreferrer',
    );
  });
});

describe('語氣', () => {
  it('畫面上沒有箭頭或驚嘆號', async () => {
    mockFetch(fixture());
    const { container } = render(<RadarPage />);

    await waitFor(() => expect(screen.getByText('腸病毒')).toBeInTheDocument());
    expect(container.textContent ?? '').not.toMatch(/[↑↓→←!！⚠]/);
  });

  it('沒有用到全 app 最強的那個紅', async () => {
    mockFetch(fixture());
    const { container } = render(<RadarPage />);

    await waitFor(() => expect(screen.getByText('腸病毒')).toBeInTheDocument());
    expect(container.innerHTML).not.toContain('primary-dark');
    expect(container.innerHTML).not.toContain('text-red');
  });

  it('說清楚這不是確診數，也不預言你的孩子會生病', async () => {
    await renderReady();
    expect(screen.getByText(/不是確診數/)).toBeInTheDocument();
    expect(screen.getByText(/身體不舒服請看醫生/)).toBeInTheDocument();
  });

  it('數字沒有被放大成頭條', async () => {
    await renderReady();

    const row = screen
      .getAllByRole('button')
      .find((b) => (b.textContent ?? '').startsWith('腸病毒'));

    expect(row).toBeDefined();
    expect(row?.innerHTML ?? '').not.toMatch(/text-(lg|xl|2xl|3xl|4xl)/);
  });
});

describe('抽屜', () => {
  it('先給可以做什麼，再給數字', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: /腸病毒/ }));
    const body = screen.getByRole('dialog').textContent ?? '';

    expect(body.indexOf('可以做什麼')).toBeGreaterThan(-1);
    expect(body.indexOf('可以做什麼')).toBeLessThan(body.indexOf('次因腸病毒就診'));
  });

  it('連得出疾管署', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: /腸病毒/ }));

    expect(screen.getByRole('link', { name: /疾管署的腸病毒說明/ })).toHaveAttribute(
      'href',
      'https://www.cdc.gov.tw/Disease/SubIndex/m3zdUk3u9GJVvddeSnhkiA',
    );
  });

  it('板上放不下的分母在抽屜的詳細數字裡補上', async () => {
    // 板上只放得下人次；率與分母是這一格可不可信的關鍵，落點在抽屜。
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: /腸病毒/ }));
    await it.click(screen.getByRole('button', { name: '詳細數字' }));
    const body = screen.getByRole('dialog').textContent ?? '';

    expect(body).toContain('100.0/萬');
    expect(body).toContain('20 人次');
    expect(body).toContain('2,000 次門診');
  });

  it('關掉之後就不在了', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: /腸病毒/ }));
    await it.click(screen.getByRole('button', { name: '關閉' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('打開的是當下那個縣市與年齡層的格子', async () => {
    // 3-6 歲的水痘基線為零，抽屜裡的狀態要跟著換，不能還停在 0-2 歲那一格。
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: '3-6 歲' }));
    await it.click(screen.getByRole('button', { name: /水痘/ }));
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveTextContent('最近沒有個案');
    expect(dialog).toHaveTextContent('花蓮縣 3-6 歲這一週有 0 次因水痘就診');
  });

  it('資料不足的格子照樣打得開，據實說算不出來', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: '連江縣' }));
    await it.click(screen.getByRole('button', { name: /腸病毒/ }));
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveTextContent('資料不足');
    // 樣本偏小的但書不必先展開就看得到。
    expect(dialog).toHaveTextContent(/容易上下跳動/);
    await it.click(screen.getByRole('button', { name: '詳細數字' }));
    expect(dialog).toHaveTextContent('11 次門診');
    // 算不出來的率不編一個數字；人次與分母是實際數到的，照實給。
    expect(dialog).toHaveTextContent('—（0 人次）');
  });

  it('抽屜裡也沒有箭頭、驚嘆號或最強的那個紅', async () => {
    const it = await renderReady();

    await it.click(screen.getByRole('button', { name: /腸病毒/ }));
    const dialog = screen.getByRole('dialog');

    expect(dialog.textContent ?? '').not.toMatch(/[↑↓→←!！⚠]/);
    expect(dialog.innerHTML).not.toContain('primary-dark');
  });
});
