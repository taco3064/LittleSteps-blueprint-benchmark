import { motion } from 'framer-motion';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { calculateAgeDisplay } from '~app/family/domain/summaryCalculator';
import type { WikiStage } from '~app/littleexplorer/domain/wikiRelevance';
import { WIKI_STAGES } from '~app/littleexplorer/domain/wikiRelevance';
import { fadeInUp, tap } from '~app/platform/components/Motion';
import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import type { ExplorerShellProps } from '../ExplorerShell';

interface ToddlerWikiProps {
  ExplorerShell: React.ComponentType<ExplorerShellProps>;
  currentChild: ChildProfile | null | undefined;
  reminderBadge: number | undefined;
  stage: string;
  setStage: React.Dispatch<React.SetStateAction<string>>;
  theme: ServiceTheme;
  currentStage: WikiStage | null;
  browser: React.ReactNode;
}

export default function ToddlerWiki(props: ToddlerWikiProps) {
  return (
    <props.ExplorerShell
      active="wiki"
      childName={props.currentChild?.name}
      ageLabel={
        props.currentChild
          ? calculateAgeDisplay(props.currentChild.birthday)
          : undefined
      }
      reminderBadge={props.reminderBadge}
    >
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div>
          <h2 className="text-sm font-semibold text-explorer-bark/70 mb-2">
            依年齡看
          </h2>
          {/* data-testid：這一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的水平
              溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
          <div
            data-testid="scroll-row-explorer-wiki-stages"
            className="row-bleed flex gap-2 py-1"
          >
            {[{ id: 'all', label: '全部' }, ...WIKI_STAGES].map(({ id, label }) => {
              const isActive = props.stage === id;

              return (
                <motion.button
                  key={id}
                  type="button"
                  whileTap={tap}
                  onClick={() => props.setStage(id)}
                  aria-pressed={isActive}
                  className={`chip shrink-0 ${
                    isActive
                      ? `chip-on ${props.theme.fill} ${props.theme.fillText} border-transparent`
                      : ''
                  }`}
                >
                  {label}
                  {props.currentStage?.id === id && (
                    <span className="text-[0.7rem] opacity-80">現在</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/*
          籌碼組隨年齡段變動，所以組別變了就重新掛載一次 WikiBrowser：它的分類
          選擇是內部狀態，若停在一個已經不再顯示的分類上，畫面會是 0 篇文章、
          又沒有任何籌碼可以取消——比原本的問題更糟。
        */}
        {props.browser}
      </motion.div>
    </props.ExplorerShell>
  );
}
