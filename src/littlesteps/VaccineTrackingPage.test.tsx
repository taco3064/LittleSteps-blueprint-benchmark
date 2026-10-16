import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type {
  ChildProfile,
  VaccineProgress,
} from '../family/domain/familyRecords/index';
import VaccineTrackingPage from './VaccineTrackingPage';

/**
 * 這一頁曾經把「改日期」和「取消接種」綁在同一個動作上：日期的 sheet 送出時
 * 呼叫的是 toggle，於是家長在已接種的那一劑上確認新日期，administered 反而被
 * 翻成 false，資料層連 administeredDate 一起刪掉——想訂正日期，整筆接種紀錄
 * 消失。這組測試守的就是「確認日期永遠是已接種，取消接種是另一個明講的動作」。
 *
 * 出生當天的孩子讓月齡篩選停在 0 個月，畫面上只剩出生那兩劑，查詢才咬得準。
 */

const child: ChildProfile = {
  id: 'c1',
  name: '小豆',
  birthday: toLocalDateKey(),
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
};

/** 出生那一劑 B 肝，doses 3 / currentDose 1。 */
const HEPB = 'hepb-birth';
const CIRCLE_RECORD = 'B型肝炎疫苗 第1劑：記錄接種日期';
const CIRCLE_EDIT = 'B型肝炎疫苗 第1劑：修改接種日期';

const administered = (administeredDate?: string): VaccineProgress => ({
  [HEPB]: { doses: { 1: { administered: true, administeredDate } } },
});

const renderPage = (vaccineProgress: VaccineProgress = {}) => {
  const onSetVaccineDose = vi.fn();
  const user = userEvent.setup();

  render(
    <VaccineTrackingPage
      currentChild={child}
      vaccineProgress={vaccineProgress}
      onSetVaccineDose={onSetVaccineDose}
    />,
  );

  return { user, onSetVaccineDose };
};

describe('還沒接種的那一劑', () => {
  it('開的是「記錄接種日期」，而且沒有取消接種的路', async () => {
    const { user } = renderPage();

    await user.click(screen.getByRole('button', { name: CIRCLE_RECORD }));

    expect(
      await screen.findByRole('heading', { name: '記錄接種日期' }),
    ).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: '取消接種記錄' })).toBeNull();
  });

  it('確認日期就是登記接種，administered 傳 true', async () => {
    const { user, onSetVaccineDose } = renderPage();

    await user.click(screen.getByRole('button', { name: CIRCLE_RECORD }));

    fireEvent.change(await screen.findByLabelText('接種日期'), {
      target: { value: '2026-05-01' },
    });

    await user.click(screen.getByRole('button', { name: '確認' }));

    expect(onSetVaccineDose.mock.calls).toEqual([
      [{ vaccineId: HEPB, doseNumber: 1, administered: true, date: '2026-05-01' }],
    ]);
  });
});

describe('已經接種的那一劑', () => {
  it('確認新日期改的是日期，不是把接種紀錄清掉', async () => {
    const { user, onSetVaccineDose } = renderPage(administered('2026-05-01'));

    await user.click(screen.getByRole('button', { name: CIRCLE_EDIT }));

    expect(
      await screen.findByRole('heading', { name: '修改接種日期' }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('接種日期'), {
      target: { value: '2026-06-02' },
    });

    await user.click(screen.getByRole('button', { name: '確認' }));

    expect(onSetVaccineDose.mock.calls).toEqual([
      [{ vaccineId: HEPB, doseNumber: 1, administered: true, date: '2026-06-02' }],
    ]);
  });

  it('取消接種記錄才會把 administered 寫成 false，並收起 sheet', async () => {
    const { user, onSetVaccineDose } = renderPage(administered('2026-05-01'));

    await user.click(screen.getByRole('button', { name: CIRCLE_EDIT }));
    await user.click(await screen.findByRole('button', { name: '取消接種記錄' }));

    expect(onSetVaccineDose.mock.calls).toEqual([
      [{ vaccineId: HEPB, doseNumber: 1, administered: false }],
    ]);

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: '修改接種日期' })).toBeNull(),
    );
  });

  it('只勾了接種、沒填日期的那一劑，還是算已接種', async () => {
    // 這一種紀錄是真實存在的。用「有沒有日期」判斷已接種與否的話，這一劑會
    // 被當成還沒打，家長按確認就變成重新登記，取消接種也找不到入口。
    const { user } = renderPage(administered());

    expect(
      screen.getByRole('button', { name: '已接種，點擊補上日期' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: CIRCLE_EDIT }));

    expect(
      await screen.findByRole('heading', { name: '修改接種日期' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '取消接種記錄' })).toBeInTheDocument();
  });
});

describe('兩排篩選器', () => {
  it('兩顆「全部」各自叫得出名字，不必先框住某一排才分得出來', async () => {
    // 兩排的標題拿掉之後，兩排的第一顆都寫著「全部」：沒有 aria-label 的話這個
    // 查詢會同時撞到兩顆按鈕，而照著控制項瀏覽的人聽到的也是兩顆一模一樣的切換
    // 鈕。查詢刻意不框住任何容器——框過的查詢今天會過，歧義回來的那天也照樣過。
    const { user } = renderPage();

    expect(screen.getAllByRole('button', { name: '全部月齡' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: '全部給付方式' })).toHaveLength(1);

    // WCAG 2.5.3（Label in Name）：語音控制是照畫面上看得見的字比對的，所以
    // 可及名稱必須包含那兩個字。「全部月齡」對得上，「月齡篩選：全部」對不上。
    for (const name of ['全部月齡', '全部給付方式']) {
      // trim：JSX 把標籤排成獨立一行時 textContent 會帶上換行與縮排，那會讓
      // 這個判斷因為排版而紅，而不是因為標籤真的不含畫面上的字。
      const visible = screen.getByRole('button', { name }).textContent?.trim();

      expect(name).toContain(visible);
    }

    // 兩顆各管一排：點月齡那顆不會動到給付方式那一排。
    expect(screen.getByRole('button', { name: '0個月' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: '全部月齡' }));

    expect(screen.getByRole('button', { name: '全部月齡' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(screen.getByRole('button', { name: '0個月' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    expect(screen.getByRole('button', { name: '全部給付方式' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
