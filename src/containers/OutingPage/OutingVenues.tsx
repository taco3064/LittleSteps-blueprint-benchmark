import { motion } from 'framer-motion';
import EmptyState from '~app/components/EmptyState';
import {
  CENTRE_DATA_ATTRIBUTION,
} from '~app/domain/centreAccess';
import { fadeInUp } from '~app/domain/motion';
import { restaurants } from '~app/domain/restaurants';

import { ALL_CITIES, MAX_RENDERED } from './outingOptions';

import { OutingAccess } from './OutingAccess';
import { OutingCities } from './OutingCities';
import { OutingSearch } from './OutingSearch';
import { OutingVenueList } from './OutingVenueList';
import type { OutingModel } from './useOutingModel';

export function OutingVenues({ model }: { model: OutingModel }) {
  const { theme, view, loadFailed, city, visible, centresLoading } = model;

  return (
    <motion.div
      key={view}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {view === 'restaurant' && (
        <div className={`panel ${theme.tint}`}>
          <h2 className={`mb-1 ${theme.ink}`}>這是精選，不是完整名單</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            全台沒有官方的親子餐廳名單，也沒有任何認證制度，所以這裡是
            {restaurants.length}
            {' 家逐家查證過的餐廳。餐廳會改時間、改低消、也會倒， 每張卡片都標了查證日期，出發前請再確認一次。'}
          </p>
        </div>
      )}

      <OutingSearch model={model} />

      {/* data-testid：這一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的水平
                  溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
      <OutingCities model={model} />

      {/* 各縣市的收費與預約規則差很多，選了縣市就把已查證的規則講清楚。 */}
      {view === 'centre' && city !== ALL_CITIES && (
        <OutingAccess model={model} />
      )}

      {!centresLoading && (
        <p className="text-xs text-ink-faint">
          {'共 '}
          {visible.length}
          {' 處'}
          {visible.length > MAX_RENDERED && `，先顯示 ${MAX_RENDERED} 處`}
        </p>
      )}

      {centresLoading
        ? (
            <p className="text-sm text-ink-muted">正在載入親子館名冊…</p>
          )
        : loadFailed && view === 'centre'
          ? (
              <EmptyState
                theme={theme}
                title="親子館資料載入失敗"
                description="請確認網路連線後重新整理頁面。"
              />
            )
          : visible.length === 0
            ? (
                <EmptyState
                  theme={theme}
                  title="找不到符合的場地"
                  description="換個關鍵字，或把縣市切回「全部縣市」。"
                />
              )
            : (
                <OutingVenueList model={model} />
              )}

      {view === 'centre' && (
        <p className="text-xs text-ink-faint leading-relaxed">
          {CENTRE_DATA_ATTRIBUTION}
        </p>
      )}
    </motion.div>
  );
}
