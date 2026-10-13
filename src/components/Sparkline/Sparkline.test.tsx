import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Sparkline from './Sparkline';

/**
 * 折線上的頂點座標，照 d 屬性的順序。`M0,28 L100,4` → `[[0,28],[100,4]]`。
 * 這幾個測試全部靠它讀出「線長什麼樣子」，所以留一個名字而不是抄六次。
 */
const vertices = (label: string) => {
  const path = screen.getByRole('img', { name: label }).querySelector('path');

  expect(path).not.toBeNull();

  return (path?.getAttribute('d') ?? '')
    .split(/[ML]/)
    .filter(Boolean)
    .map((pair) => pair.split(',').map(Number) as [number, number]);
};

describe('Sparkline', () => {
  it('點夠多的時候畫一條線', () => {
    render(<Sparkline values={[1, 2, 3, 4]} label="腸病毒最近 8 週" />);
    expect(vertices('腸病毒最近 8 週')).toHaveLength(4);
  });

  it('只有一個點就不畫——一個點連不成趨勢', () => {
    const { container } = render(<Sparkline values={[null, null, 5]} label="水痘" />);

    expect(container.querySelector('svg')).toBeNull();
  });

  it('全都缺值就不畫，不畫一條假的線', () => {
    const { container } = render(
      <Sparkline values={[null, null, null]} label="水痘" />,
    );

    expect(container.querySelector('svg')).toBeNull();
  });

  it('空序列不會炸也不會畫', () => {
    const { container } = render(<Sparkline values={[]} label="水痘" />);

    expect(container.querySelector('svg')).toBeNull();
  });

  it('零是有效資料，不是缺值', () => {
    // 「那一週真的零例」跟「那一週我們沒有資料」是兩件事，混掉就是不實陳述。
    render(<Sparkline values={[0, 0]} label="水痘" />);
    expect(vertices('水痘')).toHaveLength(2);
  });

  it('拉滿容器寬度，不寫死像素', () => {
    // 390px 的手機上，寫死寬高的圖表會溢出卡片；只給 viewBox 而不關掉
    // preserveAspectRatio，線又會被留白擠在中間，w-full 就白給了。
    render(<Sparkline values={[1, 2]} label="腹瀉" />);
    const svg = screen.getByRole('img', { name: '腹瀉' });

    expect(svg).toHaveAttribute('viewBox', '0 0 100 32');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'none');
    expect(svg).toHaveClass('w-full');
    expect(svg).not.toHaveAttribute('width');
    expect(svg).not.toHaveAttribute('height');
  });

  it('缺值的那幾週在 x 軸上留著原來的位置', () => {
    // 壓掉的話「中間斷了六週」會被畫成「連續兩週在升」，那是編出來的趨勢。
    render(
      <Sparkline values={[1, null, null, null, null, null, null, 2]} label="類流感" />,
    );

    expect(vertices('類流感').map(([x]) => x)).toEqual([0, 100]);
  });

  it('最高與最低都落在畫布內，而且方向沒有反過來', () => {
    render(<Sparkline values={[10, 50, 30, 90]} label="手足口病" />);
    const ys = vertices('手足口病').map(([, y]) => y);

    ys.forEach((y) => {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(32);
    });

    // svg 的 y 往下長：最大值該落在最小的 y 上。
    expect(Math.min(...ys)).toBe(ys[3]);
    expect(Math.max(...ys)).toBe(ys[0]);
  });

  it('一路持平的序列畫成一條水平線，而不是 NaN', () => {
    // max - min 為零時除法會炸出 NaN，整條路徑跟著消失。
    render(<Sparkline values={[7, 7, 7]} label="疱疹性咽峽炎" />);
    const ys = vertices('疱疹性咽峽炎').map(([, y]) => y);

    ys.forEach((y) => expect(Number.isFinite(y)).toBe(true));
    expect(new Set(ys).size).toBe(1);
  });

  it('是圖片而不是裝飾，讀螢幕的人聽得到它在說什麼', () => {
    render(<Sparkline values={[1, 2]} label="腸病毒最近 8 週的就診率變化" />);

    expect(
      screen.getByRole('img', { name: '腸病毒最近 8 週的就診率變化' }),
    ).toBeInTheDocument();
  });

  it('只有一條線：不填色塊、不畫座標軸，顏色交給外面決定', () => {
    // stroke 用 currentColor——服務色住在 serviceTheme，不在這支通用元件裡。
    render(<Sparkline values={[1, 2, 3]} label="腹瀉" />);
    const svg = screen.getByRole('img', { name: '腹瀉' });

    expect(svg.querySelectorAll('path')).toHaveLength(1);
    const path = svg.querySelector('path');

    expect(path).toHaveAttribute('fill', 'none');
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(svg.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});
