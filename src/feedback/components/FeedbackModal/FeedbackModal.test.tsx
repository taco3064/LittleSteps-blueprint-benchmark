import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  VENUE_REPORT_REASON_LABEL,
  type VenueReportTarget,
} from '~app/feedback/domain/venueReport/venueReport';
import FeedbackModal from './FeedbackModal';

/**
 * The rules cap `feedbacks/$feedbackId/content` at 5000 characters, and a
 * `.validate` failure reaches the client as the same PERMISSION_DENIED as a
 * throttle refusal. The form is the only place that can keep the two apart:
 * if the field cannot exceed the limit, a denial can only mean "too soon".
 */
describe('the general feedback form', () => {
  it('caps the content field at the limit the rules enforce', () => {
    render(
      <FeedbackModal
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        userName="媽媽"
      />,
    );

    expect(screen.getByLabelText(/詳細內容/)).toHaveAttribute(
      'maxlength',
      '5000',
    );
  });
});

/**
 * Whether the report carries the parent's Google name and email is asked here
 * and nowhere else. Both variants of the form ask it, both start unticked, and
 * the answer travels as the third argument of `onSubmit` — so no caller can
 * attach contact details the parent did not agree to.
 */

const REPLY_BOX = /讓我們可以回覆你/;

const venueTarget: VenueReportTarget = {
  service: 'babyoasis',
  id: 'tpe-sogo-zhongxiao',
  name: 'SOGO 忠孝館',
  address: '臺北市大安區忠孝東路四段 45 號',
  claims: [{ label: '開放時間', value: '11:00-21:30' }],
};

const replyBox = () => screen.getByRole('checkbox', { name: REPLY_BOX });

describe.each([
  ['the general form', undefined],
  ['the venue report form', { target: venueTarget, signIn: null }],
] as const)('%s', (_name, venue) => {
  const renderForm = () =>
    render(
      <FeedbackModal
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        userName="媽媽"
        venue={venue}
      />,
    );

  it('asks before attaching contact details, and starts unticked', () => {
    renderForm();

    expect(replyBox()).toBeInTheDocument();
    expect(replyBox()).not.toBeChecked();
  });

  it('gives the question a thumb-sized row', () => {
    renderForm();

    // min-h-tap is the 44px token; the row is the label, so the whole sentence
    // is the target rather than the 20px box alone.
    expect(replyBox().closest('label')?.className).toContain('min-h-tap');
  });

  it('ticks from a tap anywhere on the row, not just on the box', async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(screen.getByText(REPLY_BOX));

    expect(replyBox()).toBeChecked();
  });
});

describe('the contact opt-in', () => {
  const renderGeneral = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
    const view = render(
      <FeedbackModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
        userName="媽媽"
      />,
    );

    return { ...view, onSubmit };
  };

  const writeAReport = async (user: UserEvent) => {
    await user.type(screen.getByLabelText(/標題/), '按鈕按不到');

    await user.type(
      screen.getByLabelText(/詳細內容/),
      '記錄頁的送出鍵按不到，換瀏覽器也一樣',
    );
  };

  it('tells the submit handler the parent asked for a reply', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderGeneral();

    await writeAReport(user);
    await user.click(replyBox());
    await user.click(screen.getByRole('button', { name: '送出回報' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit).toHaveBeenCalledWith(
      '按鈕按不到',
      '記錄頁的送出鍵按不到，換瀏覽器也一樣',
      true,
    );
  });

  it('says no for a parent who never touched the box', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderGeneral();

    await writeAReport(user);
    await user.click(screen.getByRole('button', { name: '送出回報' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit).toHaveBeenCalledWith(
      '按鈕按不到',
      '記錄頁的送出鍵按不到，換瀏覽器也一樣',
      false,
    );
  });

  it('asks again the next time the form opens, like every other field', async () => {
    const user = userEvent.setup();
    const { rerender } = renderGeneral();

    await user.click(replyBox());
    expect(replyBox()).toBeChecked();

    rerender(
      <FeedbackModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        userName="媽媽"
      />,
    );

    rerender(
      <FeedbackModal
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        userName="媽媽"
      />,
    );

    expect(replyBox()).not.toBeChecked();
  });
});

describe('the venue report form', () => {
  it(
    'carries the same question, since a wrong address needs no reply '
    + 'address either',
    async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <FeedbackModal
          isOpen
          onClose={vi.fn()}
          onSubmit={onSubmit}
          userName="媽媽"
          venue={{ target: venueTarget, signIn: null }}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: VENUE_REPORT_REASON_LABEL.gone }),
      );

      await user.click(replyBox());
      await user.click(screen.getByRole('button', { name: '送出回報' }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][2]).toBe(true);
    },
  );

  it(
    'has nothing to ask while the parent is still signed out, but says '
    + 'the question is coming',
    () => {
      render(
        <FeedbackModal
          isOpen
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          userName="用戶"
          venue={{ target: venueTarget, signIn: vi.fn() }}
        />,
      );

      expect(
        screen.queryByRole('checkbox', { name: REPLY_BOX }),
      ).not.toBeInTheDocument();

      // The box is one screen away, so the notice must not read as though signing
      // in already hands over the name and email. This is the last sentence a
      // parent standing at a locked door gets before deciding.
      expect(screen.getByText(/登入只是用來認得這個帳號/)).toHaveTextContent(
        '登入後在送出前自己勾',
      );
    },
  );
});
