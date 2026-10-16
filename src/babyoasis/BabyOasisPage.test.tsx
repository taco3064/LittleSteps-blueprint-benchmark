import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../platform/index';
import { savePreferences } from '../portal/services/preferences/preferences';
import BabyOasisPage from './BabyOasisPage';
import type { NursingRoom } from './domain/nursingRooms/index';

/**
 * BabyOasis 的頁面測試。守的是三件家長看得見的事：
 *
 *   一張空地圖必須讀得出是「還在載」還是「載不到」，永遠不能讀成「這裡沒有
 *   哺乳室」。那份 1.1 MB 的名單刻意不進 PWA 預快取，離線第一次開就是這條路。
 *
 *   定位要嘛有結果、要嘛講出失敗，不能無聲地一直轉。先前轉圈是被兩秒的計時器
 *   停掉的，和真正的定位結果無關。
 *
 *   兩張底部面板是對話框：Escape 關得掉。
 *
 * Leaflet 需要量得到大小的 DOM，happy-dom 給不出來，所以地圖層換成最小替身；
 * 每個 Marker 是一顆按鈕，按下去等同在地圖上點那一筆。
 */

// createElement 是在 factory 裡動態 import 的：vi.mock 的 factory 會被提升到
// 所有 import 之上，靜態 binding 在它執行時不保證已經初始化。
vi.mock('react-leaflet', async () => {
  const { createElement, Fragment } = await import('react');
  // fitBounds 是篩選後把視角帶到剩下那些點上用的，和 flyTo 一樣只要存在。
  const map = { flyTo: () => {}, getZoom: () => 12, fitBounds: () => {} };

  return {
    MapContainer: ({ children }: { children?: ReactNode }) =>
      createElement('div', null, children),
    TileLayer: () => null,
    // title 只有捷運站那顆標記會帶，測試靠它把「定位點」和哺乳室分開數。
    Marker: ({
      eventHandlers,
      title,
    }: {
      eventHandlers?: { click?: () => void };
      title?: string;
    }) =>
      createElement('button', {
        type: 'button',
        'data-testid': 'marker',
        'data-title': title,
        onClick: () => eventHandlers?.click?.(),
      }),
    Popup: ({ children }: { children?: ReactNode }) =>
      createElement(Fragment, null, children),
    useMap: () => map,
  };
});

vi.mock('react-leaflet-cluster', async () => {
  const { createElement } = await import('react');

  return {
    default: ({ children }: { children?: ReactNode }) =>
      createElement('div', null, children),
  };
});

/**
 * 兩筆座標相鄰，第三筆在高雄——附近清單才篩得出東西。第四筆是公司行號又不在
 * 依法應設置名單上，篩選才有東西可以排除。
 */
const ROOMS: NursingRoom[] = [
  {
    id: 'tpe-sogo-zhongxiao',
    name: 'SOGO 忠孝館',
    address: '臺北市大安區忠孝東路四段 45 號',
    city: '臺北市',
    district: '大安區',
    latitude: 25.0417,
    longitude: 121.5436,
  },
  {
    id: 'tpe-shinkong-tianmu',
    name: '新光三越天母店',
    address: '臺北市士林區中山北路六段 77 號',
    city: '臺北市',
    district: '士林區',
    latitude: 25.1153,
    longitude: 121.5301,
  },
  {
    id: 'khh-dream-mall',
    name: '統一夢時代購物中心',
    address: '高雄市前鎮區中華五路 789 號',
    city: '高雄市',
    district: '前鎮區',
    latitude: 22.5956,
    longitude: 120.3065,
  },
  {
    id: 'ntpc-foxconn',
    name: '鴻海精密工業股份有限公司(虎躍廠)',
    address: '新北市土城區自由街 2 號',
    city: '新北市',
    district: '土城區',
    latitude: 24.9721,
    longitude: 121.4432,
  },
];

const fetchMock = vi.fn();
const getCurrentPosition = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  getCurrentPosition.mockReset();

  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderPage = () =>
  render(
    <ToastProvider>
      <BabyOasisPage />
    </ToastProvider>,
  );

/** 掛載並等名單進來；回傳 userEvent instance，測試接著就能操作。 */
async function renderReady(rooms: NursingRoom[] = ROOMS) {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => rooms });
  const user = userEvent.setup();

  renderPage();
  await screen.findByRole('searchbox', { name: '搜尋哺乳室' });

  return user;
}

const locateButton = () => screen.getByRole('button', { name: '定位我的位置' });

describe('哺乳室名單載入', () => {
  it('資料還沒到時說在載入，不會把空地圖說成沒有哺乳室', () => {
    // 永遠不 settle：模擬還在下載那 1.1 MB 的那段時間。用 executor 形式而不是
    // Promise.withResolvers，因為 tsconfig 的 lib 停在 ES2020。
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText('正在載入全台哺乳室資料…')).toBeInTheDocument();
    // 沒有搜尋框可打，就不會有人得到「找不到符合的哺乳室」這個答案。
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByText('找不到符合的哺乳室')).not.toBeInTheDocument();
  });

  it('載入失敗時給重新載入，而不是一片「找不到符合的哺乳室」', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => [] });
    const user = userEvent.setup();

    renderPage();

    const retry = await screen.findByRole('button', { name: '重新載入' });

    expect(screen.getByText('哺乳室資料載入失敗')).toBeInTheDocument();
    expect(screen.queryByText('找不到符合的哺乳室')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('marker')).toEqual([]);

    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ROOMS });
    await user.click(retry);

    expect(
      await screen.findByRole('searchbox', { name: '搜尋哺乳室' }),
    ).toBeInTheDocument();

    expect(screen.getAllByTestId('marker')).toHaveLength(ROOMS.length);

    expect(
      screen.queryByRole('button', { name: '重新載入' }),
    ).not.toBeInTheDocument();
  });
});

describe('定位', () => {
  it('帶著有限的逾時去定位，不是無限期等下去', async () => {
    const user = await renderReady();

    await user.click(locateButton());

    const options = getCurrentPosition.mock.calls[0][2] as PositionOptions;

    expect(Number.isFinite(options.timeout)).toBe(true);
    expect(options.timeout).toBeGreaterThan(0);
  });

  it('還沒有結果之前按鈕保持停用，不會因為計時器自己恢復', async () => {
    const user = await renderReady();
    const locate = locateButton();

    await user.click(locate);
    expect(locate).toBeDisabled();

    // 先前是兩秒的 setTimeout 把轉圈停掉；時間過去而定位沒回來，就不該恢復。
    vi.useFakeTimers();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    vi.useRealTimers();

    expect(locate).toBeDisabled();
  });

  it('定位逾時會停下轉圈並講出逾時，和被拒絕權限講的不是同一句', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = await renderReady();
    const locate = locateButton();

    await user.click(locate);
    const onError = getCurrentPosition.mock.calls[0][1] as PositionErrorCallback;

    act(() => {
      // GeolocationPositionError.TIMEOUT
      onError({ code: 3, message: 'Timeout expired' } as GeolocationPositionError);
    });

    expect(await screen.findByText(/定位逾時/)).toBeInTheDocument();
    expect(locate).not.toBeDisabled();
    expect(screen.queryByText(/定位權限/)).not.toBeInTheDocument();
  });

  it('被拒絕權限時講權限', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = await renderReady();

    await user.click(locateButton());
    const onError = getCurrentPosition.mock.calls[0][1] as PositionErrorCallback;

    act(() => {
      // GeolocationPositionError.PERMISSION_DENIED
      onError({
        code: 1,
        message: 'User denied Geolocation',
      } as GeolocationPositionError);
    });

    expect(await screen.findByText(/定位權限/)).toBeInTheDocument();
    expect(screen.queryByText(/定位逾時/)).not.toBeInTheDocument();
  });

  it('定位成功後列出附近的哺乳室', async () => {
    const user = await renderReady();

    await user.click(locateButton());

    const onSuccess = getCurrentPosition.mock.calls[0][0] as PositionCallback;

    act(() => {
      onSuccess({
        coords: { latitude: 25.0418, longitude: 121.5437 },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    const nearbySheet = await screen.findByRole('dialog', { name: '附近的哺乳室' });

    expect(within(nearbySheet).getByText('SOGO 忠孝館')).toBeInTheDocument();

    // 高雄那筆在十公里外，不該混進「附近」。
    expect(
      within(nearbySheet).queryByText('統一夢時代購物中心'),
    ).not.toBeInTheDocument();

    expect(locateButton()).not.toBeDisabled();
  });
});

describe('捷運站定位', () => {
  /** 選一站：開選單、打站名、按下去。 */
  async function pickStation(user: UserEvent, name: string) {
    await user.click(screen.getByRole('button', { name: '捷運站' }));
    await user.type(screen.getByRole('searchbox', { name: '搜尋捷運站' }), name);
    await user.click(screen.getByRole('button', { name }));
  }

  it('選了一站就列出那一站附近的哺乳室，標題講的是那一站', async () => {
    const user = await renderReady();

    // 忠孝復興距 SOGO 忠孝館 25 公尺；天母店最近的站在 1.3 公里外。
    await pickStation(user, '忠孝復興');

    const sheet = await screen.findByRole('dialog', { name: '捷運忠孝復興站附近' });

    expect(within(sheet).getByText('SOGO 忠孝館')).toBeInTheDocument();
    expect(within(sheet).queryByText('新光三越天母店')).not.toBeInTheDocument();
    // 800 公尺是「這一站附近」，不是整個市區。
    expect(within(sheet).queryByText('統一夢時代購物中心')).not.toBeInTheDocument();
  });

  it('選站是定位點而不是篩選：哺乳室標記一顆都沒少，另外多一顆標那一站', async () => {
    const user = await renderReady();

    await pickStation(user, '忠孝復興');

    const markers = screen.getAllByTestId('marker');

    expect(markers.filter((marker) => !marker.dataset.title)).toHaveLength(
      ROOMS.length,
    );

    expect(
      markers.filter((marker) => marker.dataset.title === '捷運忠孝復興站'),
    ).toHaveLength(1);

    // 副標題還是全台筆數：選站沒有篩掉任何一筆。
    expect(screen.getByText(`全台 ${ROOMS.length} 處哺乳室`)).toBeInTheDocument();
  });

  it('這一站附近真的沒有就說沒有，不會把清單靜靜留空', async () => {
    const user = await renderReady();

    await pickStation(user, '美麗島');

    const sheet = await screen.findByRole('dialog', { name: '捷運美麗島站附近' });

    expect(
      within(sheet).getByText(/800 公尺內沒有已登記的哺乳室/),
    ).toBeInTheDocument();
  });

  it('重新定位就放掉那一站——「附近」只能有一個原點', async () => {
    const user = await renderReady();

    await pickStation(user, '忠孝復興');

    expect(
      await screen.findByRole('dialog', { name: '捷運忠孝復興站附近' }),
    ).toBeInTheDocument();

    await user.click(locateButton());
    const onSuccess = getCurrentPosition.mock.calls[0][0] as PositionCallback;

    act(() => {
      onSuccess({
        coords: { latitude: 25.1153, longitude: 121.5301 },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    expect(
      await screen.findByRole('dialog', { name: '附近的哺乳室' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '捷運站' })).toBeInTheDocument();
  });
});

describe('底部面板', () => {
  it('點地圖標記開啟詳情，Escape 關得掉，關掉後還能再開下一筆', async () => {
    const user = await renderReady();
    const markers = screen.getAllByTestId('marker');

    await user.click(markers[0]);
    const detail = await screen.findByRole('dialog', { name: ROOMS[0].name });

    expect(detail).toHaveAttribute('aria-modal', 'true');

    await user.keyboard('{Escape}');

    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      {
        timeout: 3000,
      },
    );

    // memo 過的標記仍然掛著活的 click handler，不是關掉就死了一次。
    await user.click(screen.getAllByTestId('marker')[1]);

    expect(
      await screen.findByRole('dialog', { name: ROOMS[1].name }),
    ).toBeInTheDocument();
  });

  it('Escape 也關得掉附近清單', async () => {
    const user = await renderReady();

    await user.click(locateButton());

    const onSuccess = getCurrentPosition.mock.calls[0][0] as PositionCallback;

    act(() => {
      onSuccess({
        coords: { latitude: 25.0418, longitude: 121.5437 },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    const nearbySheet = await screen.findByRole('dialog', { name: '附近的哺乳室' });

    expect(nearbySheet).toHaveAttribute('aria-modal', 'true');

    await user.keyboard('{Escape}');

    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      {
        timeout: 3000,
      },
    );
  });

  it('詳情面板給得出回報的路，而且未登入就看得到', async () => {
    // 這一頁完全公開，測試裡也沒有 AuthProvider——就是站在鎖著的門口的那個
    // 人看到的畫面。入口消失的話，那趟白跑沒有任何地方回報得掉。
    const user = await renderReady();

    await user.click(screen.getAllByTestId('marker')[0]);
    const detail = await screen.findByRole('dialog', { name: ROOMS[0].name });

    expect(
      within(detail).getByRole('button', { name: /這裡的資訊不對？/ }),
    ).toBeInTheDocument();
  });

  it('回報表單開著時，Escape 只關表單，詳情面板留在原地', async () => {
    // 兩張對話框的 Escape 監聽器都掛在 document 上，同一次按鍵兩邊都收得到。
    // 一次關掉兩層的話，家長取消回報就會連自己剛剛在看哪一筆都一起失去。
    const user = await renderReady();

    await user.click(screen.getAllByTestId('marker')[0]);
    const detail = await screen.findByRole('dialog', { name: ROOMS[0].name });

    await user.click(
      within(detail).getByRole('button', { name: /這裡的資訊不對？/ }),
    );

    expect(
      await screen.findByRole('dialog', { name: '這裡的資訊不對？' }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(
      () =>
        expect(
          screen.queryByRole('dialog', { name: '這裡的資訊不對？' }),
        ).not.toBeInTheDocument(),
      { timeout: 3000 },
    );

    expect(screen.getByRole('dialog', { name: ROOMS[0].name })).toBeInTheDocument();
  });
});

/**
 * 篩選必須同時作用在副標題與地圖上。清單少了幾筆而標記還是全台那一片，是家長
 * 最容易誤讀的一種狀態：他會以為篩選壞了，或以為那些點都符合條件。
 */
describe('篩選', () => {
  it('排除內部場所之後，副標題與地圖標記一起收', async () => {
    const user = await renderReady();

    expect(screen.getByText(`全台 ${ROOMS.length} 處哺乳室`)).toBeInTheDocument();
    expect(screen.getAllByTestId('marker')).toHaveLength(ROOMS.length);

    await user.click(screen.getByRole('button', { name: '排除內部場所' }));

    // 鴻海那一筆是公司行號又不在名單上，只剩三筆。
    expect(await screen.findByText('篩選後 3 處')).toBeInTheDocument();
    expect(screen.getAllByTestId('marker')).toHaveLength(3);
    expect(screen.queryByText(/全台 \d+ 處哺乳室/)).not.toBeInTheDocument();
  });

  it('選了場所類型，標記只留那一類', async () => {
    const user = await renderReady();

    await user.click(screen.getByRole('button', { name: '百貨・賣場' }));

    expect(await screen.findByText('篩選後 3 處')).toBeInTheDocument();
    expect(screen.getAllByTestId('marker')).toHaveLength(3);
  });

  it('只選縣市時重新框地圖，但不列出那個縣市的整份清單', async () => {
    const user = await renderReady();

    await user.click(screen.getByRole('button', { name: '全部縣市' }));
    await user.click(await screen.findByRole('button', { name: '臺北市' }));

    expect(await screen.findByText('篩選後 2 處')).toBeInTheDocument();
    expect(screen.getAllByTestId('marker')).toHaveLength(2);
    // 臺北市實際有 611 處，那份清單沒有人會讀。
    expect(screen.queryByText(/共 \d+ 處/)).not.toBeInTheDocument();
  });
});

/**
 * 記住上次篩到哪裡。
 *
 * 重新整理最常發生在出門途中——手機把 PWA 重載一次，而那正是最不該重新篩一次
 * 的時候。位置類的東西刻意不記：選定的捷運站與地圖視角在回答「我現在站在哪」，
 * 沿用上一次只會把家長帶到昨天去過的地方。
 */
describe('記住上次的篩選條件', () => {
  /** 重新整理：卸載再掛一次，只有記在裝置上的東西活得下來。 */
  const reload = async () => {
    cleanup();

    return renderReady();
  };

  it('區域、場所類型與排除內部場所，重新整理之後都還在', async () => {
    const user = await renderReady();

    await user.click(screen.getByRole('button', { name: '全部縣市' }));
    await user.click(await screen.findByRole('button', { name: '臺北市' }));
    await user.click(screen.getByRole('button', { name: '百貨・賣場' }));
    await user.click(screen.getByRole('button', { name: '排除內部場所' }));
    expect(await screen.findByText('篩選後 2 處')).toBeInTheDocument();

    await reload();

    expect(await screen.findByText('篩選後 2 處')).toBeInTheDocument();
    expect(screen.getAllByTestId('marker')).toHaveLength(2);

    expect(screen.getByRole('button', { name: '百貨・賣場' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(screen.getByRole('button', { name: '排除內部場所' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('清掉裝置上的資料就回到沒有任何篩選', async () => {
    const user = await renderReady();

    await user.click(screen.getByRole('button', { name: '排除內部場所' }));
    expect(await screen.findByText('篩選後 3 處')).toBeInTheDocument();

    localStorage.clear();
    await reload();

    expect(
      await screen.findByText(`全台 ${ROOMS.length} 處哺乳室`),
    ).toBeInTheDocument();

    expect(screen.getAllByTestId('marker')).toHaveLength(ROOMS.length);
  });

  it('記下來的縣市在今天的資料裡不存在時就放掉，不留一張空地圖', async () => {
    // 國健署會改場所名稱，某個縣市也可能一筆都不剩。留著那個縣市，家長會拿到
    // 一張空地圖，而空地圖講不出它是因為上次的一個選擇才空的。
    savePreferences({ oasisCity: '不存在市', oasisDistrict: '不存在區' });
    await renderReady();

    expect(
      await screen.findByText(`全台 ${ROOMS.length} 處哺乳室`),
    ).toBeInTheDocument();

    expect(screen.getAllByTestId('marker')).toHaveLength(ROOMS.length);
  });

  it('縣市還在但行政區不在了，就只放掉行政區', async () => {
    savePreferences({ oasisCity: '臺北市', oasisDistrict: '不存在區' });
    await renderReady();

    // 臺北市那兩筆都留著，只是不再限在某一個行政區。
    expect(await screen.findByText('篩選後 2 處')).toBeInTheDocument();
  });

  it('記下來的場所類型不是籌碼上那六個時就不套用', async () => {
    // 辦公場所與學校有分類但沒有籌碼。套上去會讓地圖無聲地少掉一半，而家長
    // 看不到自己在篩什麼。
    savePreferences({ oasisCategory: 'workplace' });
    await renderReady();

    expect(
      await screen.findByText(`全台 ${ROOMS.length} 處哺乳室`),
    ).toBeInTheDocument();
  });

  it('選定的捷運站不記——那是「現在站在哪」，不是「我家在哪」', async () => {
    const user = await renderReady();

    await user.click(screen.getByRole('button', { name: '捷運站' }));

    await user.type(
      screen.getByRole('searchbox', { name: '搜尋捷運站' }),
      '忠孝復興',
    );

    await user.click(screen.getByRole('button', { name: '忠孝復興' }));

    expect(
      await screen.findByRole('dialog', { name: '捷運忠孝復興站附近' }),
    ).toBeInTheDocument();

    await reload();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(
      screen.getAllByTestId('marker').filter((marker) => marker.dataset.title),
    ).toEqual([]);
  });
});
