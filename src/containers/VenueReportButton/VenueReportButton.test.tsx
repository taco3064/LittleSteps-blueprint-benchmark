import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { update } from 'firebase/database';
import { ToastProvider } from '../Toast';
import {
  VENUE_REPORT_REASON_LABEL,
  type VenueReportTarget,
} from '~app/domain/venueReport';
import type * as AuthContextModule from '~app/contexts/Auth';
import VenueReportButton from './VenueReportButton';

/**
 * This button exists for the parent standing at a locked nursing-room door,
 * and that parent is very likely signed out: the map, the venue list and the
 * disease radar are the three services that need no account at all.
 *
 * So the two states worth defending are "signed out sees the action and is
 * told why signing in is needed", and "signed in sends a record that names the
 * venue without the parent typing it".
 */

const signInWithGoogle = vi.fn();

let currentUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
} | null = null;

vi.mock('~app/hooks/useAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthContextModule>();

  return {
    ...actual,
    useOptionalAuth: () => ({
      user: currentUser,
      loading: false,
      signInWithGoogle,
      signOut: vi.fn(),
    }),
  };
});

const target: VenueReportTarget = {
  service: 'babyoasis',
  id: 'tpe-sogo-zhongxiao',
  name: 'SOGO 忠孝館',
  address: '臺北市大安區忠孝東路四段 45 號',
  claims: [
    { label: '開放時間', value: '11:00-21:30' },
    { label: '使用條件', value: '需洽服務台' },
  ],
};

const openReport = async () => {
  const user = userEvent.setup();

  render(
    <ToastProvider>
      <VenueReportButton target={target} />
    </ToastProvider>,
  );

  await user.click(screen.getByRole('button', { name: /這裡的資訊不對？/ }));

  return user;
};

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
    : (payload?.[key] as Record<string, unknown> & {
        title: string;
        content: string;
        userId: string;
      });
};

beforeEach(() => {
  currentUser = null;
  signInWithGoogle.mockClear();
  vi.mocked(update).mockClear();
});

describe('a signed-out parent', () => {
  it('sees the report action instead of an entry point that disappeared', () => {
    render(<VenueReportButton target={target} />);

    expect(
      screen.getByRole('button', { name: /這裡的資訊不對？/ }),
    ).toBeInTheDocument();
  });

  it('is told which venue they are reporting, and what signing in is for', async () => {
    await openReport();

    expect(screen.getByText('SOGO 忠孝館')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: '用 Google 登入' }),
    ).toBeInTheDocument();

    // A form that cannot be sent is worse than no form: what belongs here is
    // the reason, not "pick a reason".
    expect(
      screen.queryByRole('button', { name: VENUE_REPORT_REASON_LABEL.gone }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: '送出回報' }),
    ).not.toBeInTheDocument();
  });

  it('signs in through the same Google flow as the rest of the app', async () => {
    const user = await openReport();

    await user.click(screen.getByRole('button', { name: '用 Google 登入' }));

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});

describe('a signed-in parent', () => {
  beforeEach(() => {
    currentUser = {
      uid: 'parent-1',
      email: 'parent@example.com',
      displayName: '媽媽',
    };
  });

  it('cannot send a report without choosing a reason', async () => {
    await openReport();

    expect(screen.getByRole('button', { name: '送出回報' })).toBeDisabled();
  });

  it('sends a complete report from one choice, with the note left empty', async () => {
    const user = await openReport();

    await user.click(
      screen.getByRole('button', { name: VENUE_REPORT_REASON_LABEL.gone }),
    );

    await user.click(screen.getByRole('button', { name: '送出回報' }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    const written = lastWrite();

    expect(written?.content).not.toContain('家長補充');
    expect(written?.userId).toBe('parent-1');
  });

  /*
    A wrong address needs no reply address. The rules take `userEmail` and
    `userName` as optional strings, so "not asked" has to be an absent key:
    an empty string is a value they accept and the inbox keeps.
  */
  it('leaves the reporter out of the record unless they asked for a reply', async () => {
    const user = await openReport();

    await user.click(
      screen.getByRole('button', { name: VENUE_REPORT_REASON_LABEL.gone }),
    );

    await user.click(screen.getByRole('button', { name: '送出回報' }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    const written = lastWrite();

    expect(written?.userId).toBe('parent-1');
    expect(written).not.toHaveProperty('userEmail');
    expect(written).not.toHaveProperty('userName');
  });

  it('attaches the account name and email when the reply box is ticked', async () => {
    const user = await openReport();

    await user.click(
      screen.getByRole('button', { name: VENUE_REPORT_REASON_LABEL.gone }),
    );

    await user.click(screen.getByRole('checkbox', { name: /讓我們可以回覆你/ }));
    await user.click(screen.getByRole('button', { name: '送出回報' }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));

    expect(lastWrite()).toMatchObject({
      userId: 'parent-1',
      userEmail: 'parent@example.com',
      userName: '媽媽',
    });
  });

  it('attaches the venue id, name and the disputed claim by itself', async () => {
    const user = await openReport();

    await user.click(
      screen.getByRole('button', { name: VENUE_REPORT_REASON_LABEL.hoursWrong }),
    );

    await user.click(screen.getByRole('button', { name: '送出回報' }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    const written = lastWrite();

    expect(written?.title).toContain('SOGO 忠孝館');
    expect(written?.content).toContain('tpe-sogo-zhongxiao');
    expect(written?.content).toContain('SOGO 忠孝館');
    expect(written?.content).toContain('11:00-21:30');
    expect(written?.content).toContain(VENUE_REPORT_REASON_LABEL.hoursWrong);
  });

  it('sends the note as well when the parent wrote one', async () => {
    const user = await openReport();

    await user.click(
      screen.getByRole('button', { name: VENUE_REPORT_REASON_LABEL.noEntry }),
    );

    await user.type(screen.getByLabelText(/還想補一句/), '門鎖著，要員工卡');
    await user.click(screen.getByRole('button', { name: '送出回報' }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    expect(lastWrite()?.content).toContain('門鎖著，要員工卡');
  });

  it(
    'is told to wait when the rules throttle a second r'
    + 'eport, not shown an SDK code',
    async () => {
      // The rules allow one feedback a minute per account. The SDK reports the
      // refusal as PERMISSION_DENIED, which means nothing to a parent.
      vi.mocked(update).mockRejectedValueOnce(
        Object.assign(new Error('PERMISSION_DENIED: Permission denied'), {
          code: 'PERMISSION_DENIED',
        }),
      );

      const user = await openReport();

      await user.click(
        screen.getByRole('button', { name: VENUE_REPORT_REASON_LABEL.gone }),
      );

      await user.click(screen.getByRole('button', { name: '送出回報' }));

      expect(
        await screen.findByText('剛剛才送出過一次，請稍後再試'),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('dialog', { name: '這裡的資訊不對？' }),
      ).toBeInTheDocument();
    },
  );

  it(
    'closes the form once the report is in, so the send' + ' is not left in doubt',
    async () => {
      const user = await openReport();

      await user.click(
        screen.getByRole('button', {
          name: VENUE_REPORT_REASON_LABEL.locationWrong,
        }),
      );

      await user.click(screen.getByRole('button', { name: '送出回報' }));

      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: '這裡的資訊不對？' }),
        ).not.toBeInTheDocument(),
      );
    },
  );
});
