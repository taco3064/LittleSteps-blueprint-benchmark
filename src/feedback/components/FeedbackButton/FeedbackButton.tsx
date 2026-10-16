import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { fadeInUp, hoverLift, tap } from '~app/platform/components/Motion';
import FeedbackModal from '../FeedbackModal';

interface FeedbackButtonProps {
  userName: string;
  onSubmit: (
    title: string,
    content: string,
    shareContact: boolean,
  ) => Promise<void>;
}

export default function FeedbackButton({
  userName,
  onSubmit,
}: FeedbackButtonProps) {
  const [showModal, setShowModal] = useState(false);

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
          'fixed bottom-6 right-6 w-14 h-14 bg-secondary-dark text-white '
          + 'rounded-full shadow-soft hover:shadow-soft-lg transition-shadow '
          + 'z-40 flex items-center justify-center'
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
        onSubmit={onSubmit}
        userName={userName}
      />
    </>
  );
}
