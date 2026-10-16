import { X } from 'lucide-react';
import type { DevelopmentCheckItem } from '~app/knowledge/domain/referenceModels';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littleexplorer;
interface QuickDiaryFormProps {
  diaryText: string;
  setDiaryText: React.Dispatch<React.SetStateAction<string>>;
  handleQuickDiary: (item: DevelopmentCheckItem) => Promise<void>;
  item: DevelopmentCheckItem;
  setDiaryFor: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function QuickDiaryForm({
  diaryText,
  setDiaryText,
  handleQuickDiary,
  item,
  setDiaryFor,
}: QuickDiaryFormProps) {
  return (
    <div className="pl-tap pr-1 pb-2 flex items-center gap-2">
      <input
        type="text"
        value={diaryText}
        onChange={(e) => setDiaryText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            void handleQuickDiary(item);
          }

          if (e.key === 'Escape') {
            setDiaryFor(null);
          }
        }}
        placeholder="要記一筆嗎？（選填）"
        autoFocus
        className={
          'flex-1 min-w-0 px-3 min-h-tap rounded-xl border '
          + 'border-explorer-sand bg-white text-sm '
          + 'text-explorer-bark'
        }
      />
      <button
        type="button"
        onClick={() => void handleQuickDiary(item)}
        disabled={!diaryText.trim()}
        className={`btn-primary px-4 text-sm ${THEME.fill} ${THEME.fillText}`}
      >
        記下來
      </button>
      <button
        type="button"
        onClick={() => setDiaryFor(null)}
        aria-label="關閉"
        className="btn-icon"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
