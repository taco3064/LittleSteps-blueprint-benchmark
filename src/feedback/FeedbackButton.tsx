import type { User } from 'firebase/auth';
import FeedbackButtonView from '~app/feedback/components/FeedbackButton';
import { useFeedback } from '~app/feedback/hooks/useFeedback';

export function FeedbackButton({ user }: { user: User | null }) {
  const firebaseChildren = useFeedback(user?.uid || null);

  // Only show for logged-in users
  if (!user) {
    return null;
  }

  const handleSubmit = async (
    title: string,
    content: string,
    shareContact: boolean,
  ) => {
    if (!user) {
      throw new Error('請先登入');
    }

    await firebaseChildren.submitFeedback({
      title,
      content,
      userId: user.uid,
      /*
        沒勾就連鍵都不出現，而不是送一個空字串：規則把這兩個欄位當選填，''
        照樣是它收得下、也會存進收件匣的字串，那等於沒問就送。勾了但帳號本來
        就沒有那個欄位時也一樣不送——原本補的 '' 與「匿名用戶」都回不了信，
        只是讓收件匣多一列看起來有、其實沒有的聯絡方式。userId 才是回報和帳號
        的關聯，這兩個欄位只為了「回得了信」而存在。
      */
      ...(shareContact && user.email ? { userEmail: user.email } : {}),
      ...(shareContact && user.displayName
        ? { userName: user.displayName }
        : {}),
    });
  };

  return (
    <FeedbackButtonView
      userName={user.displayName || '用戶'}
      onSubmit={handleSubmit}
    />
  );
}
