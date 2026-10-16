import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { User } from 'firebase/auth';
import { update } from 'firebase/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedbackButton } from './FeedbackButton';

/**
 * What actually reaches `feedbacks/$feedbackId`.
 *
 * The form asks whether the parent wants a reply; this button is the one place
 * that decides what the answer means on the wire. Unticked has to mean the two
 * contact keys are absent, not present and empty: `database.rules.json` treats
 * `userEmail` and `userName` as optional strings, so an empty one is a value
 * the rules accept and the inbox keeps — a record of an account that was never
 * asked. `userId` is what ties a report to an account either way.
 */

const account = {
  uid: 'parent-1',
  email: 'parent@example.com',
  displayName: '小豆媽',
} as User;

/**
 * The feedback row travels in a root multi-path update alongside the sender's
 * `lastFeedbackAt` stamp, so the record is the `feedbacks/...` entry of the
 * last update. The tsconfig `lib` stops at ES2020, so `Array.prototype.at` is
 * unavailable.
 */
const lastWrite = () => {
  const { calls } = vi.mocked(update).mock;

  const payload = calls[calls.length - 1]?.[1] as
    Record<string, unknown> | undefined;

  const key = Object.keys(payload ?? {}).find((path) =>
    path.startsWith('feedbacks/'),
  );

  return key === undefined
    ? undefined
    : (payload?.[key] as Record<string, unknown>);
};

const writeAReport = async (user: UserEvent) => {
  await user.type(screen.getByLabelText(/標題/), '按鈕按不到');

  await user.type(
    screen.getByLabelText(/詳細內容/),
    '記錄頁的送出鍵按不到，換瀏覽器也一樣',
  );
};

const openForm = async () => {
  const user = userEvent.setup();

  render(<FeedbackButton user={account} />);
  await user.click(screen.getByRole('button', { name: '問題回報' }));
  await writeAReport(user);

  return user;
};

beforeEach(() => {
  vi.mocked(update).mockClear();
});

describe('FeedbackButton', () => {
  it(
    'sends no name and no email when the parent left the reply box ' + 'alone',
    async () => {
      const user = await openForm();

      await user.click(screen.getByRole('button', { name: '送出回報' }));

      await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
      const written = lastWrite();

      expect(written).toMatchObject({
        title: '按鈕按不到',
        userId: 'parent-1',
      });

      expect(written).not.toHaveProperty('userEmail');
      expect(written).not.toHaveProperty('userName');
    },
  );

  it(
    'attaches the account name and email once the parent asks for a ' + 'reply',
    async () => {
      const user = await openForm();

      await user.click(
        screen.getByRole('checkbox', { name: /讓我們可以回覆你/ }),
      );

      await user.click(screen.getByRole('button', { name: '送出回報' }));

      await waitFor(() => expect(update).toHaveBeenCalledTimes(1));

      expect(lastWrite()).toMatchObject({
        userId: 'parent-1',
        userEmail: 'parent@example.com',
        userName: '小豆媽',
      });
    },
  );

  it(
    'stays hidden with nobody signed in, because a report needs auth '
    + '!= null',
    () => {
      render(<FeedbackButton user={null} />);

      expect(
        screen.queryByRole('button', { name: '問題回報' }),
      ).not.toBeInTheDocument();
    },
  );
});
