import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NursingRoom } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { categoryOf, isInternalVenue } from '~app/domain/roomCategory';
import RoomSearch, { NO_FILTERS, type RoomFilters } from './RoomSearch';
import type { MrtStation } from '~app/domain/mrtStations';

/**
 * 搜尋列守四件事：
 *
 *   選定一筆之後關鍵字要清掉。清單是浮在地圖上的，留著關鍵字等於家長關掉詳情
 *   面板後，看到的還是清單蓋住地圖與剛剛飛過去的那個點。
 *
 *   比對不只看名稱。家長記得的常常是路名或區名，這件事只要有人「順手簡化成
 *   只搜 name」就會靜靜消失。
 *
 *   沒有關鍵字、只按了 chip 也要列得出清單。篩選存在的理由就是「我還不知道
 *   要找哪一間」。
 *
 *   被條件篩空和關鍵字打錯要講不一樣的話，而且前者得給一條回得去的路。
 */

const ROOMS: NursingRoom[] = [
  {
    id: 'tpe-sogo-zhongxiao',
    name: 'SOGO 忠孝館',
    address: '臺北市大安區忠孝東路四段 45 號',
    city: '臺北市',
    district: '大安區',
    floor: '3 樓婦嬰用品區',
    latitude: 25.0417,
    longitude: 121.5436,
  },
  {
    id: 'tpe-shinkong-tianmu',
    // 地址與店名都不含「士林」，只有 district 有：驗得出真的看了行政區。
    name: '新光三越天母店',
    address: '臺北市中山北路六段 77 號',
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
    // 公司行號又不在依法應設置名單上：家長走不進去的那一種。
    id: 'ntpc-foxconn',
    name: '鴻海精密工業股份有限公司(虎躍廠)',
    address: '新北市土城區自由街 2 號',
    city: '新北市',
    district: '土城區',
    latitude: 24.9721,
    longitude: 121.4432,
  },
  {
    id: 'tpe-main-station',
    name: '臺灣鐵路管理局臺北車站',
    address: '臺北市中正區北平西路 3 號',
    city: '臺北市',
    district: '中正區',
    statutory: true,
    remarks: '請洽服務台',
    latitude: 25.0478,
    longitude: 121.517,
  },
];

const theme = SERVICE_THEME.babyoasis;

/**
 * 頁面持有 filters，並且只在頁面篩一次——這支測試因此得把那一層一起演出來，
 * 否則按了 chip 只會改到 state，清單永遠不動。
 */
function Harness({
  rooms,
  onSelect,
}: {
  rooms: NursingRoom[];
  onSelect?: (room: NursingRoom) => void;
}) {
  const [filters, setFilters] = useState<RoomFilters>(NO_FILTERS);
  // 捷運站是定位點而不是篩選條件，所以它不參與這裡的過濾——頁面也一樣。
  const [station, setStation] = useState<MrtStation | null>(null);

  const visible = rooms.filter(
    (room) =>
      (filters.category === null || categoryOf(room) === filters.category)
      && (!filters.excludeInternal || !isInternalVenue(room))
      && (filters.city === null || room.city === filters.city)
      && (filters.district === null || room.district === filters.district),
  );

  return (
    <RoomSearch
      rooms={visible}
      areaRooms={rooms}
      theme={theme}
      filters={filters}
      onFiltersChange={setFilters}
      station={station}
      onStationChange={setStation}
      onSelect={onSelect ?? (() => {})}
    />
  );
}

const searchBox = () => screen.getByRole('searchbox', { name: '搜尋哺乳室' });
const chip = (name: string) => screen.getByRole('button', { name });

describe('RoomSearch', () => {
  it('選了一筆之後清掉關鍵字，結果清單把地圖讓出來', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<Harness rooms={ROOMS} onSelect={onSelect} />);

    await user.type(searchBox(), 'SOGO');
    await user.click(await screen.findByRole('button', { name: /SOGO 忠孝館/ }));

    expect(onSelect).toHaveBeenCalledWith(ROOMS[0]);
    expect(searchBox()).toHaveValue('');
    expect(screen.queryByText(/共 \d+ 處/)).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /SOGO 忠孝館/ }),
    ).not.toBeInTheDocument();
  });

  it('用行政區也找得到，不是只比對店名', async () => {
    const user = userEvent.setup();

    render(<Harness rooms={ROOMS} />);

    await user.type(searchBox(), '士林區');

    expect(
      await screen.findByRole('button', { name: /新光三越天母店/ }),
    ).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /夢時代/ })).not.toBeInTheDocument();
  });

  it('真的沒有相符的才說找不到', async () => {
    const user = userEvent.setup();

    render(<Harness rooms={ROOMS} />);

    // 沒打字時清單完全讓位，不能先說「找不到」。
    expect(screen.queryByText('找不到符合的哺乳室')).not.toBeInTheDocument();

    await user.type(searchBox(), '南極');

    expect(await screen.findByText('找不到符合的哺乳室')).toBeInTheDocument();
  });

  it('超過 30 筆只畫 30 列，並說出還有幾處', async () => {
    const many: NursingRoom[] = Array.from({ length: 35 }, (_, i) => ({
      id: `mall-${i}`,
      name: `大遠百 ${i} 館`,
      address: `臺中市西屯區文心路 ${i} 號`,
      city: '臺中市',
      district: '西屯區',
      latitude: 24.16 + i / 1000,
      longitude: 120.64,
    }));

    const user = userEvent.setup();

    render(<Harness rooms={many} />);

    await user.type(searchBox(), '大遠百');

    expect(await screen.findByText(/共 35 處/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /大遠百/ })).toHaveLength(30);
    expect(screen.getByText(/還有 5 處/)).toBeInTheDocument();
  });

  it('只按場所類型也列得出清單，而且只留那一類', async () => {
    const user = userEvent.setup();

    render(<Harness rooms={ROOMS} />);

    await user.click(chip('百貨・賣場'));

    expect(
      await screen.findByRole('button', { name: /SOGO 忠孝館/ }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /夢時代/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /臺北車站/ })).not.toBeInTheDocument();
    expect(chip('百貨・賣場')).toHaveAttribute('aria-pressed', 'true');

    // 再按同一顆就是取消：多選要另外給圖例，而那個圖例沒有人會讀。
    await user.click(chip('百貨・賣場'));
    expect(chip('百貨・賣場')).toHaveAttribute('aria-pressed', 'false');

    expect(
      screen.queryByRole('button', { name: /SOGO 忠孝館/ }),
    ).not.toBeInTheDocument();
  });

  it('排除內部場所會把公司裡的哺乳室拿掉，也說得出自己是開著的', async () => {
    const user = userEvent.setup();

    render(<Harness rooms={ROOMS} />);

    expect(chip('排除內部場所')).toHaveAttribute('aria-pressed', 'false');
    await user.click(chip('排除內部場所'));

    expect(chip('排除內部場所')).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByText(/共 4 處/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /鴻海/ })).not.toBeInTheDocument();
  });

  it('沒排除時把走不進去的那一筆標出來，需要洽服務台的另外標', async () => {
    const user = userEvent.setup();

    render(<Harness rooms={ROOMS} />);

    await user.type(searchBox(), '鴻海');
    expect(await screen.findByText('內部場所')).toBeInTheDocument();

    await user.clear(searchBox());
    await user.type(searchBox(), '車站');
    expect(await screen.findByText('需洽服務台')).toBeInTheDocument();
  });

  it('被條件篩空時說的是條件，而且清得掉', async () => {
    const user = userEvent.setup();

    render(<Harness rooms={ROOMS} />);

    await user.click(chip('排除內部場所'));
    await user.type(searchBox(), '鴻海');

    expect(await screen.findByText('這些條件下沒有哺乳室')).toBeInTheDocument();
    expect(screen.queryByText('找不到符合的哺乳室')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '清除篩選' }));

    expect(searchBox()).toHaveValue('');
    expect(chip('排除內部場所')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByText('這些條件下沒有哺乳室')).not.toBeInTheDocument();

    // 條件真的回去了：同一個關鍵字現在找得到那一筆。
    await user.type(searchBox(), '鴻海');
    expect(await screen.findByRole('button', { name: /鴻海/ })).toBeInTheDocument();
  });

  it('區域鈕開的是對話框，選了行政區就把條件帶回來', async () => {
    const user = userEvent.setup();

    render(<Harness rooms={ROOMS} />);

    const area = chip('全部縣市');

    expect(area).toHaveAttribute('aria-haspopup', 'dialog');
    await user.click(area);

    const dialog = await screen.findByRole('dialog', { name: '選擇區域' });

    await user.click(await screen.findByRole('button', { name: '臺北市' }));
    // 選縣市不關面板，家長才有機會接著縮到行政區。
    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '士林區 1' }));

    expect(chip('臺北市 士林區')).toBeInTheDocument();

    expect(
      await screen.findByRole('button', { name: /新光三越天母店/ }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /SOGO 忠孝館/ }),
    ).not.toBeInTheDocument();
  });
});
