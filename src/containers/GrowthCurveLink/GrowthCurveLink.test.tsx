import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GrowthCurveLink from './GrowthCurveLink';

/**
 * WHO 生長標準涵蓋 0-36 個月，整個幼兒期都用得上，但成長曲線那一頁住在
 * LittleSteps，而 LittleExplorer 裡一處都沒提過——這個分頁還正好叫「成長」。
 * 家長合理地會以為這個 app 的曲線只到一歲。
 */

beforeEach(() => {
  window.history.replaceState(null, '', '/littleexplorer');
});

describe('GrowthCurveLink', () => {
  it('說明資料到 3 歲都適用，家長才知道值得點', () => {
    render(<GrowthCurveLink />);

    expect(
      screen.getByRole('heading', { name: /身高體重的成長曲線/ }),
    ).toBeInTheDocument();

    expect(screen.getByText(/到 3 歲都適用/)).toBeInTheDocument();
  });

  it('導到 LittleSteps 的成長曲線圖', async () => {
    const user = userEvent.setup();

    render(<GrowthCurveLink />);

    await user.click(screen.getByRole('button'));
    expect(window.location.pathname).toBe('/littlesteps/growth-charts');
  });
});
