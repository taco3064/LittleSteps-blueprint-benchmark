import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ALLERGY_DESCRIPTION_LIMIT,
  FOOD_NAME_LIMIT,
  FOOD_NOTES_LIMIT,
} from '../../../family/domain/recordLimits/recordLimits';
import type { FoodTrialRecord } from '../../../family/domain/familyRecords/index';
import FoodTrialModal from './FoodTrialModal';

/**
 * 這張表以前先呼叫 onSave 再無條件 onClose：寫入失敗被上層接成一則 toast，
 * 表單卻已經關掉，家長打的食物名稱、過敏反應、嘗試日期全部要重來一次。
 *
 * 順手釘住另外兩件事：每個欄位都要有對得上的 label（原本 label 沒有 htmlFor、
 * input 沒有 id，讀螢幕與點文字都對不到欄位），以及點錯的嘗試日期要移得掉。
 */

const existing: FoodTrialRecord = {
  id: 'f1',
  foodName: '香蕉',
  firstTriedDate: '2026-08-28',
  trialDates: ['2026-08-28', '2026-08-29'],
  hasAllergy: false,
  createdAt: '2026-08-28T00:00:00.000Z',
};

const renderModal = (editingFood: FoodTrialRecord | null = null) => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  const user = userEvent.setup();

  render(
    <FoodTrialModal
      isOpen
      onClose={onClose}
      onSave={onSave}
      editingFood={editingFood}
    />,
  );

  return { user, onSave, onClose };
};

describe('寫入失敗時', () => {
  it('表單不關，打好的食物名稱還在，錯誤顯示在表單裡', async () => {
    const { user, onSave, onClose } = renderModal();

    vi.mocked(onSave).mockRejectedValue(new Error('權限不足，無法寫入'));

    await user.type(screen.getByLabelText(/食物名稱/), '地瓜');
    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('權限不足，無法寫入');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/食物名稱/)).toHaveValue('地瓜');
  });

  it('寫入成功才關', async () => {
    const { user, onSave, onClose } = renderModal();

    await user.type(screen.getByLabelText(/食物名稱/), '地瓜');
    await user.click(screen.getByRole('button', { name: '儲存' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('沒填食物名稱時說在表單裡，不會送出', async () => {
    const { user, onSave } = renderModal();

    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('請輸入食物名稱');
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('嘗試日期', () => {
  it('點錯的日期移得掉，存下去就少了那一天', async () => {
    const { user, onSave } = renderModal(existing);

    await user.click(
      screen.getByRole('button', { name: '移除嘗試日期 2026年8月29日' }),
    );

    expect(
      screen.queryByRole('button', { name: '移除嘗試日期 2026年8月29日' }),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: '更新' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].trialDates).toEqual({ '2026-08-28': true });
  });

  it('舊紀錄多記過一天之後兩種形狀並存，表單兩種都讀得到', async () => {
    // 資料庫存陣列是 0、1、… 為 key 的物件；在上面多記一天就是這個樣子。
    const mixed: FoodTrialRecord = {
      ...existing,
      trialDates: { 0: '2026-08-28', 1: '2026-08-29', '2026-08-31': true },
    };

    const { user, onSave } = renderModal(mixed);

    expect(screen.getByText('已記錄 3 次嘗試')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: '移除嘗試日期 2026年8月28日' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: '移除嘗試日期 2026年8月31日' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '更新' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    expect(onSave.mock.calls[0][0].trialDates).toEqual({
      '2026-08-28': true,
      '2026-08-29': true,
      '2026-08-31': true,
    });
  });
});

describe('欄位上限', () => {
  // 規則對食物名稱、備註與過敏反應的補充說明各有長度上限；超過時回來的是
  // PERMISSION_DENIED，表單只能照印。欄位本身不能超過規則，那個錯誤才不會出現。
  it('食物名稱、備註與過敏反應說明的上限就是規則的上限', async () => {
    const { user } = renderModal();

    expect(screen.getByLabelText(/食物名稱/)).toHaveAttribute(
      'maxlength',
      String(FOOD_NAME_LIMIT),
    );

    expect(screen.getByLabelText('備註')).toHaveAttribute(
      'maxlength',
      String(FOOD_NOTES_LIMIT),
    );

    await user.click(screen.getByRole('switch', { name: '有過敏反應' }));

    expect(screen.getByLabelText('補充說明')).toHaveAttribute(
      'maxlength',
      String(ALLERGY_DESCRIPTION_LIMIT),
    );
  });
});
