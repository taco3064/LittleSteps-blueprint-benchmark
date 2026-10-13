import { AnimatePresence, motion } from 'framer-motion';
import { tap } from '~app/domain/motion';
import AccountButton from '../AccountButton';
import AppBar from '../AppBar';
import AppHomeButton from '../AppHomeButton';

import { VIEWS } from './outingOptions';

import { OutingChecklist } from './OutingChecklist';
import { OutingVenues } from './OutingVenues';
import { useOutingModel } from './useOutingModel';

export default function OutingPage() {
  const model = useOutingModel();
  const { theme, view, chooseView } = model;

  return (
    <div className={`min-h-dscreen ${theme.pageBg}`}>
      <AppBar
        theme={theme}
        title={theme.name}
        subtitle={theme.role}
        actions={(
          <>
            <AccountButton
              service="littleouting"
              className="bg-outing-light hover:bg-outing/40 text-outing-ink"
            />
            <AppHomeButton className={
              'bg-outing-light'
              + ' hover:bg-outing/40 text-outing-ink'
            }
            />
          </>
        )}
      />

      <main className="screen-body space-y-4">
        {/* 三個分頁：兩種場地 + 不會過期的檢查清單 */}
        <div className="flex gap-2">
          {VIEWS.map(({ id, label }) => (
            <motion.button
              key={id}
              type="button"
              whileTap={tap}
              onClick={() => chooseView(id)}
              aria-pressed={view === id}
              className={`chip flex-1 justify-center ${
                view === id
                  ? `chip-on ${theme.fill} ${theme.fillText} border-transparent`
                  : ''
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {view === 'checklist'
            ? (
                <OutingChecklist key="checklist" />
              )
            : (
                <OutingVenues key={view} model={model} />
              )}
        </AnimatePresence>
      </main>
    </div>
  );
}
