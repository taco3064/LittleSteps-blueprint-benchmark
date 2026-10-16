import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { CENTRE_DATA_ATTRIBUTION } from '~app/littleouting/domain/centreAccess';
import type { Venue } from '~app/littleouting/domain/venueModels';
import type { useOutingState } from '~app/littleouting/hooks/useOutingState';
import EmptyState from '~app/platform/components/EmptyState';
import { fadeInUp } from '~app/platform/components/Motion';
import { OutingAccessRules } from '../OutingAccessRules';
import { OutingChecklist } from '../OutingChecklist';
import { OutingCityPicker } from '../OutingCityPicker';
import { OutingHeader } from '../OutingHeader';
import { OutingRestaurantNotice } from '../OutingRestaurantNotice';
import { OutingResultCount } from '../OutingResultCount';
import { OutingSearch } from '../OutingSearch';
import { OutingTabs } from '../OutingTabs';
import { OutingVenueList } from '../OutingVenueList';

/** 縣市籌碼裡的「全部縣市」。 */
const ALL_CITIES = 'all';

type OutingViewProps = ReturnType<typeof useOutingState>
  & { headerActions: ReactNode } & {
    renderVenue: (venue: Venue) => ReactNode;
  };

export function OutingView({
  view,
  query,
  setQuery,
  loadFailed,
  cities,
  city,
  scrollerRef,
  selectedRef,
  visible,
  centresLoading,
  access,
  chooseView,
  chooseCity,
  headerActions,
  renderVenue,
}: OutingViewProps) {
  const theme = SERVICE_THEME.littleouting;

  return (
    <div className={`min-h-dscreen ${theme.pageBg}`}>
      <OutingHeader headerActions={headerActions} theme={theme} />

      <main className="screen-body space-y-4">
        {/* 三個分頁：兩種場地 + 不會過期的檢查清單 */}
        <OutingTabs theme={theme} view={view} chooseView={chooseView} />

        <AnimatePresence mode="wait">
          {view === 'checklist'
            ? (
                <OutingChecklist visible={visible} />
              )
            : (
                <motion.div
                  key={view}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {view === 'restaurant' && <OutingRestaurantNotice theme={theme} />}

                  <OutingSearch view={view} query={query} setQuery={setQuery} />

                  {/* data-testid：這一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的水平
                  溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
                  <OutingCityPicker
                    theme={theme}
                    cities={cities}
                    city={city}
                    scrollerRef={scrollerRef}
                    selectedRef={selectedRef}
                    chooseCity={chooseCity}
                  />

                  {/* 各縣市的收費與預約規則差很多，選了縣市就把已查證的規則講清楚。 */}
                  {view === 'centre' && city !== ALL_CITIES && (
                    <OutingAccessRules theme={theme} city={city} access={access} />
                  )}

                  {!centresLoading && (
                    <OutingResultCount visible={visible} />
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
                            <OutingVenueList
                              renderVenue={renderVenue}
                              visible={visible}
                            />
                          )}

                  {view === 'centre' && (
                    <p className="text-xs text-ink-faint leading-relaxed">
                      {CENTRE_DATA_ATTRIBUTION}
                    </p>
                  )}
                </motion.div>
              )}
        </AnimatePresence>
      </main>
    </div>
  );
}
