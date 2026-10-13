import { motion } from 'framer-motion';
import ExplorerShell from '../ExplorerShell';
import ToothChart from '~app/components/ToothChart';
import {
  TODDLER_MAX_MONTHS,
} from '~app/domain/ageBands';
import { listItem, stagger } from '~app/domain/motion';
import type {
  DevelopmentDomain,
} from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { calculateAgeDisplay } from '~app/domain/summaryCalculator';
import GrowthCurveLink from '../GrowthCurveLink';

import { DevelopmentAgePicker } from './DevelopmentAgePicker';
import { DevelopmentChecks } from './DevelopmentChecks';
import { developmentEligibility } from './DevelopmentEligibility';
import { DevelopmentGraduation } from './DevelopmentGraduation';
import { DevelopmentProgress } from './DevelopmentProgress';
import { DevelopmentWarnings } from './DevelopmentWarnings';
import { useDevelopmentModel, type DevelopmentPageProps } from './useDevelopmentModel';

const THEME = SERVICE_THEME.littleexplorer;

const DOMAIN_ORDER: DevelopmentDomain[] = [
  'gross-motor',
  'fine-motor',
  'language',
  'cognitive',
  'social',
];

export default function DevelopmentPage(props: DevelopmentPageProps) {
  const model = useDevelopmentModel(props);

  const {
    currentChild,
    toothProgress,
    reminderBadge,
    onToggleTooth,
    ageMonths,
    bandItems,
    warning,
  } = model;

  return (
    <ExplorerShell
      active="development"
      childName={currentChild?.name}
      ageLabel={
        currentChild ? calculateAgeDisplay(currentChild.birthday) : undefined
      }
      reminderBadge={reminderBadge}
    >
      {developmentEligibility(model) ?? (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {ageMonths >= TODDLER_MAX_MONTHS && (
            <DevelopmentGraduation />
          )}

          <DevelopmentAgePicker model={model} />

          {/* 這個分頁叫「成長」卻沒有身高體重。WHO 標準到 36 個月都適用，
              但那張圖住在 LittleSteps，而這裡從來沒提過。
              滿 3 歲之後就不顯示：WHO 這份資料只到 36 個月，再往後那張圖
              算不出百分位，而這張卡片正是拿百分位當賣點。 */}
          {ageMonths < TODDLER_MAX_MONTHS && <GrowthCurveLink />}

          <DevelopmentProgress model={model} />

          {DOMAIN_ORDER.map((domain) => {
            const items = bandItems.filter((item) => item.domain === domain);

            if (items.length === 0) {
              return null;
            }

            return (
              <DevelopmentChecks
                key={domain}
                model={model}
                domain={domain}
                items={items}
              />
            );
          })}

          <motion.div variants={listItem}>
            <ToothChart
              progress={toothProgress}
              ageMonths={ageMonths}
              onToggleTooth={onToggleTooth}
            />
          </motion.div>

          {warning && (
            <DevelopmentWarnings model={model} />
          )}

          <p className={`text-xs leading-relaxed px-1 ${THEME.muted}`}>
            每個孩子的發展速度不同，本表僅供家長觀察參考，不是診斷工具。若有疑慮，正式評估請至兒童發展聯合評估中心。
          </p>
        </motion.div>
      )}
    </ExplorerShell>
  );
}
