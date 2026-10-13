import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../Toast';
import CountyPicker from './CountyPicker';

const COUNTIES = ['台北市', '新北市', '花蓮縣', '連江縣'];

const getCurrentPosition = vi.fn();

function renderPicker(selected = '台北市', onSelect = vi.fn()) {
  render(
    <ToastProvider>
      <CountyPicker counties={COUNTIES} selected={selected} onSelect={onSelect} />
    </ToastProvider>,
  );

  return onSelect;
}

const locateButton = () => screen.getByRole('button', { name: '用目前位置選縣市' });

/** 台北 101，落在 COUNTY_CENTROIDS 的台北市上。 */
const TAIPEI = { coords: { latitude: 25.034, longitude: 121.5645 } };

beforeEach(() => {
  getCurrentPosition.mockReset();

  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CountyPicker 的 chip', () => {
  it('每個縣市一顆 chip，選中的那顆標出來', () => {
    renderPicker('花蓮縣');

    COUNTIES.forEach((county) => {
      expect(screen.getByRole('button', { name: county })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: '花蓮縣' })).toHaveClass('chip-on');

    expect(screen.getByRole('button', { name: '台北市' })).not.toHaveClass(
      'chip-on',
    );
  });

  it('選中的 chip 對讀螢幕的人也說得出自己被選中', () => {
    renderPicker('花蓮縣');

    expect(screen.getByRole('button', { name: '花蓮縣' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(screen.getByRole('button', { name: '台北市' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('點一顆 chip 就把縣市交回去', async () => {
    const user = userEvent.setup();
    const onSelect = renderPicker('台北市');

    await user.click(screen.getByRole('button', { name: '連江縣' }));
    expect(onSelect).toHaveBeenCalledWith('連江縣');
  });

  it('chip 不會被壓扁，這一列是橫向捲的', () => {
    const { container } = render(
      <ToastProvider>
        <CountyPicker counties={COUNTIES} selected="台北市" onSelect={vi.fn()} />
      </ToastProvider>,
    );

    // 少了 shrink-0，22 顆 chip 會在 390px 上被擠成一團而不是捲動。
    expect(screen.getByRole('button', { name: '台北市' }).className).toContain(
      'shrink-0',
    );

    expect(container.querySelector('.row-bleed')).not.toBeNull();
  });
});

describe('CountyPicker 的定位', () => {
  it('定位鈕是 44px 的圖示鈕，而且說得出自己是做什麼的', () => {
    renderPicker();
    expect(locateButton().className).toContain('btn-icon');
  });

  it('定位成功就選到最近的縣市', async () => {
    const user = userEvent.setup();

    getCurrentPosition.mockImplementation((onOk: PositionCallback) =>
      onOk(TAIPEI as GeolocationPosition),
    );

    const onSelect = renderPicker('花蓮縣');

    await user.click(locateButton());
    expect(onSelect).toHaveBeenCalledWith('台北市');
  });

  it('定位到的縣市不在資料裡就說出來，不靜默', async () => {
    const user = userEvent.setup();

    // 台中車站：不在這次的 counties 清單裡。
    getCurrentPosition.mockImplementation((onOk: PositionCallback) =>
      onOk({
        coords: { latitude: 24.1369, longitude: 120.6869 },
      } as GeolocationPosition),
    );

    const onSelect = renderPicker('花蓮縣');

    await user.click(locateButton());
    expect(onSelect).not.toHaveBeenCalled();
    expect(await screen.findByText('找不到你所在縣市的資料')).toBeInTheDocument();
  });

  it('定位失敗給得出下一步，不是什麼都沒發生', async () => {
    const user = userEvent.setup();

    getCurrentPosition.mockImplementation(
      (_ok: PositionCallback, onErr: () => void) => onErr(),
    );

    const onSelect = renderPicker();

    await user.click(locateButton());
    expect(onSelect).not.toHaveBeenCalled();

    expect(
      await screen.findByText('沒辦法取得位置，請直接選縣市'),
    ).toBeInTheDocument();
  });

  it('瀏覽器沒有定位功能時直說，不會丟例外', async () => {
    const user = userEvent.setup();

    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    renderPicker();
    await user.click(locateButton());
    expect(await screen.findByText('您的瀏覽器不支援定位功能')).toBeInTheDocument();
  });
});
