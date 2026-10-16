import { motion } from 'framer-motion';
import { Calendar, List } from 'lucide-react';
import { hoverLift, listItem, stagger, tap } from '~app/platform/components/Motion';
import type { TrackingTab, ViewMode } from '~app/littlesteps/domain/foodTypes';
import type { FoodStats } from '~app/littlesteps/hooks/useFoodTracking';

const GUIDE_CARDS: { view: ViewMode; title: string; description: string }[] = [
  {
    view: 'guide-overview',
    title: '開始使用指南',
    description: '副食品添加原則與時機',
  },
  { view: 'guide-stages', title: '發展階段', description: '奶量與副食品轉換' },
  { view: 'guide-menu', title: '菜單建議', description: '月份推薦與過敏等級' },
  { view: 'guide-safety', title: '安全須知', description: '禁忌食物與注意事項' },
];

interface FoodHomeViewProps {
  stats: FoodStats;
  onOpenTracking: (tab: TrackingTab) => void;
  onOpenGuide: (view: ViewMode) => void;
}

/** 副食品頁的主頁：自己的追蹤概況，加上四張知識庫入口。 */
export default function FoodHomeView({
  stats, onOpenTracking, onOpenGuide,
}: FoodHomeViewProps) {
  return (
    <div className="space-y-6">
      <div className="panel bg-mint-soft">
        <h2 className="mb-1">我的副食品追蹤</h2>
        <p className="text-sm text-ink-muted mb-4">記錄寶寶的食物嘗試與過敏反應</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-ink">{stats.total}</div>
            <div className="text-sm text-ink-muted mt-1">已試食物</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-mint-dark">
              {stats.noAllergy}
            </div>
            <div className="text-sm text-ink-muted mt-1">無過敏</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-butter-dark">
              {stats.withAllergy}
            </div>
            <div className="text-sm text-ink-muted mt-1">有過敏</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOpenTracking('foods')}
            className="btn-primary w-full text-sm"
          >
            <List className="w-5 h-5" />
            <span>我的食物清單</span>
          </button>
          <button
            onClick={() => onOpenTracking('tracker')}
            className="btn-secondary w-full text-sm"
          >
            <Calendar className="w-5 h-5" />
            <span>4×3 追蹤</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3">副食品知識庫</h2>

        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {GUIDE_CARDS.map((guide) => (
            <motion.button
              key={guide.view}
              variants={listItem}
              whileHover={hoverLift}
              whileTap={tap}
              onClick={() => onOpenGuide(guide.view)}
              className="card-tap text-left"
            >
              <h3 className="mb-1">{guide.title}</h3>
              <p className="text-sm text-ink-muted">{guide.description}</p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
