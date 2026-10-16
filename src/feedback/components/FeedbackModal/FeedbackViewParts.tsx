import { motion } from 'framer-motion';
import { FEEDBACK_CONTENT_LIMIT } from '~app/feedback/domain/feedbackLimits';
import {
  VENUE_REPORT_NOTE_LIMIT,
  VENUE_REPORT_REASONS,
  VENUE_REPORT_REASON_LABEL,
  type VenueReportReason,
  type VenueReportTarget,
} from '~app/feedback/domain/venueReport';
import ModalFrame from '~app/platform/components/ModalFrame';
import { tap } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { ContactOptIn, ReportContext } from './FeedbackFields';
export const FIELD
  = 'w-full min-h-tap px-4 py-3 rounded-2xl border border-ink/15 '
    + 'text-ink placeholder-ink-faint transition-colors';
export const LABEL = 'block text-sm font-medium text-ink mb-1';

export function SignInNotice({ onSignIn }: SignInNoticeProps) {
  return (
    <div>
      <p className="text-sm text-ink leading-relaxed">
        回報會連同這一處的名稱與編號存進我們的收件匣，所以要先登入：我們才知道同一筆資料有幾個人回報過，也才擋得掉大量灌水的假回報。
      </p>
      <p className="text-sm text-ink-muted leading-relaxed mt-2">
        登入只是用來認得這個帳號，不會建立寶寶檔案，也不會碰到任何孩子的資料。要不要一起送出你的
        Google 帳號名稱與 email，登入後在送出前自己勾。
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="btn-primary w-full mt-4"
      >
        用 Google 登入
      </button>
    </div>
  );
}

export function ReasonChips({
  service,
  value,
  onPick,
  disabled,
}: ReasonChipsProps) {
  const theme = SERVICE_THEME[service];

  return (
    <fieldset disabled={disabled}>
      <legend className={LABEL}>
        哪裡不對？
        {' '}
        <span className="text-primary-dark">*</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {VENUE_REPORT_REASONS.map((id) => {
          const isOn = value === id;

          return (
            <motion.button
              key={id}
              type="button"
              whileTap={tap}
              // 再按一次同一顆就是取消，和篩選籤一致。
              onClick={() => onPick(isOn ? null : id)}
              aria-pressed={isOn}
              className={`chip ${
                isOn
                  ? `chip-on ${theme.fill} ${theme.fillText} border-transparent`
                  : ''
              }`}
            >
              {VENUE_REPORT_REASON_LABEL[id]}
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FeedbackModalView0Part1({
  venue,
  handleSubmit,
  reason,
  setReason,
  setError,
  isSubmitting,
  content,
  setContent,
  errorBox,
  shareContact,
  setShareContact,
}: FeedbackModalView0Part1Props) {
  return (
    <>
      <ReportContext target={venue.target} />

      {venue.signIn
        ? (
            <SignInNotice onSignIn={venue.signIn} />
          )
        : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <ReasonChips
                service={venue.target.service}
                value={reason}
                onPick={(picked) => {
                  setReason(picked);
                  setError(null);
                }}
                disabled={isSubmitting}
              />

              <div>
                <label htmlFor="venueReportNote" className={LABEL}>
                  還想補一句？（選填）
                </label>
                <textarea
                  id="venueReportNote"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`${FIELD} resize-none`}
                  rows={3}
                  placeholder="例如：門鎖著、已經改成儲藏室、搬到三樓了"
                  maxLength={VENUE_REPORT_NOTE_LIMIT}
                  disabled={isSubmitting}
                />
              </div>

              {errorBox}

              <ContactOptIn
                checked={shareContact}
                onChange={setShareContact}
                disabled={isSubmitting}
              />

              <button
                type="submit"
                disabled={isSubmitting || reason === null}
                className="btn-primary w-full"
              >
                {isSubmitting ? '送出中...' : '送出回報'}
              </button>
            </form>
          )}

      <p className="text-xs text-ink-muted text-center mt-4 leading-relaxed">
        回報會進到我們的收件匣，由人確認後才會改資料，地圖上的內容不會立刻變動。
      </p>
    </>
  );
}

export function FeedbackModalView0Part2({
  handleSubmit,
  title,
  setTitle,
  setError,
  isSubmitting,
  content,
  setContent,
  contentLength,
  isContentValid,
  errorBox,
  shareContact,
  setShareContact,
}: FeedbackModalView0Part2Props) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="feedbackTitle" className={LABEL}>
          標題
          {' '}
          <span className="text-primary-dark">*</span>
        </label>
        <input
          id="feedbackTitle"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          className={FIELD}
          placeholder="簡短描述您的問題或建議"
          maxLength={100}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="feedbackContent" className={LABEL}>
          詳細內容
          {' '}
          <span className="text-primary-dark">*</span>
        </label>
        <textarea
          id="feedbackContent"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          className={`${FIELD} resize-none`}
          rows={6}
          placeholder="請詳細描述您遇到的問題或想要的功能（至少 10 個字）"
          // 上限就是規則的上限。超過規則的長度回來的是和一分鐘限制同一個
          // PERMISSION_DENIED，表單擋在這裡，那個拒絕才只剩一個意思。
          maxLength={FEEDBACK_CONTENT_LIMIT}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <p
            className={`text-xs ${
              contentLength === 0
                ? 'text-ink-faint'
                : isContentValid
                  ? 'text-mint-dark'
                  : 'text-butter-dark'
            }`}
          >
            {contentLength === 0
              ? '請輸入至少 10 個字'
              : isContentValid
                ? `已輸入 ${contentLength} 個字`
                : `還需要 ${10 - contentLength} 個字`}
          </p>
          <p className="text-xs text-ink-faint">
            {contentLength}
            /
            {FEEDBACK_CONTENT_LIMIT}
          </p>
        </div>
      </div>

      {errorBox}

      <ContactOptIn
        checked={shareContact}
        onChange={setShareContact}
        disabled={isSubmitting}
      />

      <button
        type="submit"
        disabled={isSubmitting || !isContentValid || !title.trim()}
        className="btn-primary w-full"
      >
        {isSubmitting ? '送出中...' : '送出回報'}
      </button>
    </form>
  );
}

export function FeedbackModalView1Part1({
  isOpen,
  onClose,
  venue,
  isSubmitting,
  handleSubmit,
  reason,
  setReason,
  setError,
  content,
  setContent,
  errorBox,
  shareContact,
  setShareContact,
  userName,
  title,
  setTitle,
  contentLength,
  isContentValid,
}: FeedbackModalView1Part1Props) {
  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title={venue ? '這裡的資訊不對？' : '問題回報'}
      closeDisabled={isSubmitting}
    >
      {venue
        ? (
            <FeedbackModalView0Part1
              venue={venue!}
              handleSubmit={handleSubmit}
              reason={reason}
              setReason={setReason}
              setError={setError}
              isSubmitting={isSubmitting}
              content={content}
              setContent={setContent}
              errorBox={errorBox}
              shareContact={shareContact}
              setShareContact={setShareContact}
            />
          )
        : (
            <>
              <div className="mb-4 p-4 bg-secondary-soft rounded-2xl">
                <p className="text-sm text-ink">
                  感謝
                  {' '}
                  <span className="font-semibold">{userName}</span>
                  {' '}
                  的回報！
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  您的意見將幫助我們改善 LittleSteps
                </p>
              </div>

              <FeedbackModalView0Part2
                handleSubmit={handleSubmit}
                title={title}
                setTitle={setTitle}
                setError={setError}
                isSubmitting={isSubmitting}
                content={content}
                setContent={setContent}
                contentLength={contentLength}
                isContentValid={isContentValid}
                errorBox={errorBox}
                shareContact={shareContact}
                setShareContact={setShareContact}
              />

              <p className="text-xs text-ink-muted text-center mt-4">
                我們會仔細閱讀每一則回報，謝謝您的支持
              </p>
            </>
          )}
    </ModalFrame>
  );
}

interface SignInNoticeProps {
  onSignIn: () => void;
}

interface ReasonChipsProps {
  service: VenueReportTarget['service'];
  value: VenueReportReason | null;
  onPick: (reason: VenueReportReason | null) => void;
  disabled: boolean;
}

interface FeedbackModalView0Part1Props {
  venue: NonNullable<
    { target: VenueReportTarget; signIn: (() => void) | null } | undefined
  >;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reason: VenueReportReason | null;
  setReason: React.Dispatch<React.SetStateAction<VenueReportReason | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isSubmitting: boolean;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  errorBox: '' | JSX.Element | null;
  shareContact: boolean;
  setShareContact: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FeedbackModalView0Part2Props {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isSubmitting: boolean;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  contentLength: number;
  isContentValid: boolean;
  errorBox: '' | JSX.Element | null;
  shareContact: boolean;
  setShareContact: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FeedbackModalView1Part1Props {
  isOpen: boolean;
  onClose: () => void;
  venue: NonNullable<
    { target: VenueReportTarget; signIn: (() => void) | null } | undefined
  >;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reason: VenueReportReason | null;
  setReason: React.Dispatch<React.SetStateAction<VenueReportReason | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  errorBox: '' | JSX.Element | null;
  shareContact: boolean;
  setShareContact: React.Dispatch<React.SetStateAction<boolean>>;
  userName: string;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  contentLength: number;
  isContentValid: boolean;
}
