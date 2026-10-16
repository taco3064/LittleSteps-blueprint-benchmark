import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { goTo } from '../../../portal/services/navigate/navigate';
import ToddlerHandoff from './ToddlerHandoff';

/**
 * 滿一歲之前，app 從來沒有告訴任何人 LittleExplorer 存在——整個
 * LittleSteps 裡沒有一處提到它。生日一直都在資料裡，只是沒人用它說話。
 */

beforeEach(() => {
  window.history.replaceState(null, '', '/littlesteps/dashboard');
});

describe('ToddlerHandoff', () => {
  it('說出孩子的名字，並說明那邊有什麼', () => {
    render(
      <ToddlerHandoff childName="小豆" onNavigate={() => goTo('littleexplorer')} />,
    );

    expect(
      screen.getByRole('heading', { name: /小豆滿一歲了/ }),
    ).toBeInTheDocument();

    // 「有什麼」比「請前往」重要：家長要先知道值不值得點。
    expect(screen.getByText(/發展檢核、兒童健檢與塗氟提醒/)).toBeInTheDocument();
  });

  it('明講舊紀錄不會消失——換服務最怕的就是這個', () => {
    render(
      <ToddlerHandoff childName="小豆" onNavigate={() => goTo('littleexplorer')} />,
    );

    expect(screen.getByText(/紀錄都會留著/)).toBeInTheDocument();
  });

  it('整張卡片都可以點，會導到 LittleExplorer', async () => {
    const user = userEvent.setup();

    render(
      <ToddlerHandoff childName="小豆" onNavigate={() => goTo('littleexplorer')} />,
    );

    await user.click(screen.getByRole('button'));
    expect(window.location.pathname).toBe('/littleexplorer');
  });
});
