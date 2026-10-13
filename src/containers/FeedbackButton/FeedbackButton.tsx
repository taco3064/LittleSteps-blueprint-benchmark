import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { User } from '~app/domain/authUser';
import FeedbackModal from '~app/components/FeedbackModal';
import { createChildRepository } from '~app/services/childRepository';
import { fadeInUp, hoverLift, tap } from '~app/domain/motion';

interface FeedbackButtonProps {
  user: User | null;
}

export default function FeedbackButton({ user }: FeedbackButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const firebaseChildren = createChildRepository(user?.uid || null);

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
      ...(shareContact && user.displayName ? { userName: user.displayName } : {}),
    });
  };

  return (
    <>
      {/* 浮動回報鍵：圖示就是這顆按鈕的全部標籤，故留著。 */}
      <motion.button
        type="button"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        whileHover={hoverLift}
        whileTap={tap}
        onClick={() => setShowModal(true)}
        className={
          'fixed bottom-6 right-6 w-14 h-14 bg-secondary-dark '
          + 'text-white rounded-full shadow-soft '
          + 'hover:shadow-soft-lg transition-shadow z-40 flex '
          + 'items-center justify-center'
        }
        title="問題回報"
        aria-label="問題回報"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        userName={user.displayName || '用戶'}
      />
    </>
  );
}
