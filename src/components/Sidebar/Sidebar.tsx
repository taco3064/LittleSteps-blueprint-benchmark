import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Baby,
  AlertCircle,
  Home,
  Syringe,
  UtensilsCrossed,
  TrendingUp,
  Moon,
  BarChart3,
  ClipboardList,
  BookOpen,
  Stethoscope,
  FileBarChart,
} from 'lucide-react';
import { User } from '~app/domain/authUser';
import { LittleStepsPage } from '~app/domain/routes'; // Import route types
import { requiresAuth } from '~app/domain/routePolicy';
import { backdrop, listItem, stagger } from '~app/domain/motion';
import { useDialogA11y } from '~app/hooks/useDialogA11y';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: LittleStepsPage;
  onNavigate: (page: LittleStepsPage) => void;
  user: User | null;
}

/** 抽屜裡每一組的標題共用同一個 eyebrow 樣式，才不會五組標題五種大小。 */
const GROUP_LABEL = 'text-xs font-semibold text-ink-faint tracking-wider mb-3 px-2';

// Menu structure organized by functional domains.
// 「這一頁要不要登入」不在這裡宣告：routePolicy 的白名單是唯一出處。抄一份
// 旗標在選單上的下場，就是里程碑、疫苗、副食品三列對未登入的人是亮的，點下去
// 卻被彈回介紹頁。
const MENU_SECTIONS = [
  {
    title: '數據中心',
    items: [
      {
        id: 'littlesteps/dashboard' as const,
        label: '儀表板',
        icon: Home,
        description: '寶寶成長總覽',
      },
      {
        id: 'littlesteps/daily-log' as const,
        label: '快速日誌',
        icon: ClipboardList,
        description: '記錄日常照顧',
      },
      {
        id: 'littlesteps/growth-charts' as const,
        label: '成長曲線圖',
        icon: TrendingUp,
        description: '追蹤身高體重發展',
      },
      {
        id: 'littlesteps/report' as const,
        label: '週報月報',
        icon: FileBarChart,
        description: '數據趨勢與報告',
      },
      {
        id: 'littlesteps/clinic-summary' as const,
        label: '看診摘要',
        icon: Stethoscope,
        description: '一鍵產生看診資料',
      },
    ],
  },
  {
    title: '發展追蹤',
    items: [
      {
        id: 'littlesteps/milestones' as const,
        label: '里程碑追蹤',
        icon: Baby,
        description: '記錄寶寶發展進度',
      },
      {
        id: 'littlesteps/vaccine-tracking' as const,
        label: '疫苗追蹤',
        icon: Syringe,
        description: '疫苗接種時程與副作用',
      },
    ],
  },
  {
    title: '飲食與睡眠',
    items: [
      {
        id: 'littlesteps/complementary-food' as const,
        label: '副食品指南',
        icon: UtensilsCrossed,
        description: '副食品添加完整攻略',
      },
      {
        id: 'littlesteps/sleep-training' as const,
        label: '睡眠訓練',
        icon: Moon,
        description: '睡眠需求與訓練技巧',
      },
      {
        id: 'littlesteps/sleep-analysis' as const,
        label: '睡眠分析',
        icon: BarChart3,
        description: '分析寶寶睡眠模式',
      },
    ],
  },
  {
    title: '照顧指南',
    items: [
      {
        id: 'littlesteps/care-guide' as const,
        label: '照顧重點',
        icon: AlertCircle,
        description: '各階段注意事項',
      },
      {
        id: 'littlesteps/baby-wiki' as const,
        label: '寶寶百科',
        icon: BookOpen,
        description: '常見狀況與處理方式',
      },
    ],
  },
];

export default function Sidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  user,
}: SidebarProps) {
  const drawerRef = useDialogA11y(isOpen, onClose);

  // Filter menu sections based on auth status
  const filteredSections = MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => user || !requiresAuth(item.id)),
  })).filter((section) => section.items.length > 0);

  const handleNavigate = (page: LittleStepsPage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...backdrop}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 z-40"
          />

          {/* Sidebar — 固定 320px 在 320px 的手機上會貼滿兩側，留一點底層可見 */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="LittleSteps 選單"
            tabIndex={-1}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={
              'fixed left-0 top-0 bottom-0 w-[min(20rem,85vw)] '
              + 'bg-white z-50 shadow-soft-lg overflow-y-auto'
            }
          >
            {/* Header */}
            <div className="sticky top-0 bg-secondary-light px-5 py-4 z-10">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-ink truncate">LittleSteps</h2>
                  <p className="text-xs text-ink-muted">育兒里程碑追蹤</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="關閉選單"
                  className="btn-icon -mr-1.5 text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 帳號與寶寶切換不在這裡了。它們是全站脈絡，但這個抽屜只在
                LittleSteps 的路由下渲染，等於另外四個服務都登不出、也換不了
                孩子。現在由每個 AppBar 上的 AccountButton 提供，這裡只留
                LittleSteps 自己的頁面導覽。 */}

            <SidebarMenu {...{ filteredSections, currentPage, handleNavigate }} />
            {/* Footer */}
            <div
              className={
                'sticky bottom-0 left-0 right-0 p-5 bg-warm-white '
                + 'border-t border-ink/5'
              }
            >
              <p className="text-xs text-ink-faint text-center">
                ©
                {' '}
                {new Date().getFullYear()}
                {' '}
                LittleSteps
                <br />
                陪伴寶貝每一步成長
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SidebarMenu({
  filteredSections,
  currentPage,
  handleNavigate,
}: {
  filteredSections: {
    title: string;
    items: (typeof MENU_SECTIONS)[number]['items'][number][];
  }[];
  currentPage: SidebarProps['currentPage'];
  handleNavigate: (page: LittleStepsPage) => void;
}) {
  return (
    <>
      {/* Menu Items - Grouped by Function */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="p-4 pb-6 space-y-6"
      >
        {filteredSections.map((section) => (
          <motion.div key={section.title} variants={stagger}>
            <h3 className={GROUP_LABEL}>{section.title}</h3>

            {/* 12 個項目的清單，圖示是真的在幫忙掃視，故保留。 */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    variants={listItem}
                    onClick={() => handleNavigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full p-3 rounded-2xl border-l-4 transition-colors text-left ${
                      isActive
                        ? 'bg-secondary-light border-secondary-dark'
                        : 'border-transparent hover:bg-ink/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isActive ? 'text-secondary-dark' : 'text-ink-muted'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold ${isActive ? 'text-secondary-dark' : 'text-ink'}`}
                        >
                          {item.label}
                        </div>
                        <div className="text-sm text-ink-muted">{item.description}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
