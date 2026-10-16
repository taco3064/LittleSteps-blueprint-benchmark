import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import { motion } from 'framer-motion';

import { tap } from '~app/platform/components/Motion';

import type { VenueKind } from '~app/littleouting/domain/venueModels';

import type { useOutingState } from '~app/littleouting/hooks/useOutingState';

type View = VenueKind | 'checklist';

const VIEWS: { id: View; label: string }[] = [
  { id: 'centre', label: '親子館' },
  { id: 'restaurant', label: '親子餐廳' },
  { id: 'checklist', label: '出發前' },
];

export function OutingTabs({
  theme,
  view,
  chooseView,
}: Pick<
  (ReturnType<typeof useOutingState> & { theme: ServiceTheme }),
  'theme' | 'view' | 'chooseView'
>) {
  return (
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
  );
}
