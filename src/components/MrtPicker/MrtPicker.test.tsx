import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MrtPicker from './MrtPicker';
import { MRT_STATIONS } from '~app/domain/mrtStations';

/**
 * 選站的路徑守三件事：
 *
 *   打站名找得到。全台 260 站，滾動不是主要路徑，搜尋才是。
 *
 *   系統籤收得窄。高雄的家長不該先經過 109 個臺北的站。
 *
 *   選了站要能取消。選定之後多一條退路，否則「不限捷運站」只能靠重新整理。
 */

const openPicker = (selected: (typeof MRT_STATIONS)[number] | null = null) => {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const user = userEvent.setup();

  render(<MrtPicker selected={selected} onSelect={onSelect} onClose={onClose} />);

  return { user, onSelect, onClose };
};

const stationButton = (name: string) => screen.getByRole('button', { name });

describe('MrtPicker', () => {
  it('打站名就收窄到那一站', async () => {
    const { user } = openPicker();

    await user.type(screen.getByRole('searchbox', { name: '搜尋捷運站' }), '劍潭');

    expect(stationButton('劍潭')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '美麗島' })).not.toBeInTheDocument();
  });

  it('選了站交還給頁面並關掉選單——它是定位點，選完就該看到地圖', async () => {
    const { user, onSelect, onClose } = openPicker();

    await user.type(screen.getByRole('searchbox', { name: '搜尋捷運站' }), '劍潭');
    await user.click(stationButton('劍潭'));

    expect(onSelect).toHaveBeenCalledTimes(1);

    expect(onSelect.mock.calls[0][0]).toMatchObject({
      name: '劍潭',
      system: '臺北捷運',
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('系統籤只留那一套系統的站', async () => {
    const { user } = openPicker();

    await user.click(stationButton('高雄捷運'));

    expect(stationButton('美麗島')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '劍潭' })).not.toBeInTheDocument();
  });

  it('找不到的時候說找不到，不是給一片空白', async () => {
    const { user } = openPicker();

    await user.type(
      screen.getByRole('searchbox', { name: '搜尋捷運站' }),
      '不存在的站',
    );

    expect(screen.getByText('找不到這一站')).toBeInTheDocument();
  });

  it('選過站之後給得起「不限捷運站」', async () => {
    const station = MRT_STATIONS.find((item) => item.name === '劍潭');
    const { user, onSelect, onClose } = openPicker(station ?? null);

    await user.click(stationButton('不限捷運站'));

    expect(onSelect).toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalled();
  });

  it('沒選站的時候不給取消——那顆按鈕沒有東西可以取消', () => {
    openPicker();

    expect(
      screen.queryByRole('button', { name: '不限捷運站' }),
    ).not.toBeInTheDocument();
  });
});
