import { useEffect, useState } from 'react';
import { FEEDBACK_FAILED_MESSAGE } from '~app/feedback/domain/feedbackErrors';
import {
  venueReportContent,
  venueReportTitle,
  type VenueReportReason,
  type VenueReportTarget,
} from '~app/feedback/domain/venueReport';
import { FeedbackModalView1Part1 } from './FeedbackViewParts';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * `shareContact` 是家長在這張表單上勾的那一格：勾了才把 Google 帳號名稱與
   * email 一起送出去。它跟著送出走，而不是由外面的元件自己決定。
   */
  onSubmit: (
    title: string,
    content: string,
    shareContact: boolean,
  ) => Promise<void>;
  userName: string;
  /**
   * 有值時這張表單是「場館資料回報」：家長勾一個原因就送得出去，名稱、編號、
   * 地址與畫面上的說法由這裡自己附上，不必再從剛剛看的那一頁抄一次。
   *
   * `signIn` 有值本身就代表現在沒有人登入。回報要寫進資料庫，而規則要求
   * auth != null，所以那時給的是「登入是為了什麼」加一顆登入鍵——而不是把
   * 入口整個藏起來，那正是家長站在鎖著的哺乳室門口卻無話可說的原因。
   */
  venue?: {
    target: VenueReportTarget;
    signIn: (() => void) | null;
  };
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
  venue,
}: FeedbackModalProps) {
  const [title, setTitle] = useState('');
  // 家長打的那段自由文字：一般回報的必填內容，場館回報的選填補充。
  const [content, setContent] = useState('');
  const [reason, setReason] = useState<VenueReportReason | null>(null);
  // 每次開表單都從「不勾」重新問一次，和其他欄位一樣。
  const [shareContact, setShareContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setReason(null);
      setShareContact(false);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = (): string | null => {
    if (venue) {
      // 補充說明是選填的：勾一個原因就是一份完整的回報。
      return reason === null ? '請選一個原因' : null;
    }

    if (!title.trim()) {
      return '請輸入標題';
    }

    if (!content.trim()) {
      return '請輸入回報內容';
    }

    if (content.trim().length < 10) {
      return '回報內容至少需要 10 個字';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 場館回報的標題與內容一律由畫面組出來，家長只出原因與（選填的）那一句話。
      const payload
        = venue && reason !== null
          ? {
              title: venueReportTitle(venue.target, reason),
              content: venueReportContent(venue.target, reason, content),
            }
          : { title: title.trim(), content: content.trim() };

      await onSubmit(payload.title, payload.content, shareContact);
      onClose();
    } catch (err: unknown) {
      console.error('提交回報失敗:', err);
      setError(err instanceof Error ? err.message : FEEDBACK_FAILED_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentLength = content.trim().length;
  const isContentValid = contentLength >= 10;

  const errorBox = error && (
    <div className="bg-primary-light border border-primary/40 rounded-2xl p-3">
      <p className="text-sm text-primary-dark">{error}</p>
    </div>
  );

  return (
    <FeedbackModalView1Part1
      isOpen={isOpen}
      onClose={onClose}
      venue={venue!}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      reason={reason}
      setReason={setReason}
      setError={setError}
      content={content}
      setContent={setContent}
      errorBox={errorBox}
      shareContact={shareContact}
      setShareContact={setShareContact}
      userName={userName}
      title={title}
      setTitle={setTitle}
      contentLength={contentLength}
      isContentValid={isContentValid}
    />
  );
}
