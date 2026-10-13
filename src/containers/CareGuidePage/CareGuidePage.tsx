import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLucideIcon } from '~app/domain/lucideIcons';
import {
  generalSafetyItems,
  monthlyCareGuides,
  careCategories,
} from '~app/domain/careGuides';
import { stagger, listItem, tap } from '~app/domain/motion';

export default function CareGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGuides = useMemo(() => {
    if (selectedCategory === 'all') {
      return monthlyCareGuides;
    }

    return monthlyCareGuides.filter((guide) => guide.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="screen">
      <div className="screen-body">
        <GeneralSafety />
        {/* Category Filter */}
        {/* data-testid: this row scrolls horizontally on purpose, so the E2E
            layout checks measure it on its own rather than counting it as page
            overflow. A scroll container has no role and no accessible name to
            select by (docs/E2E_TEST_PLAN.md §6). */}
        <div
          data-testid="scroll-row-care-guide-categories"
          className="row-bleed flex gap-2 pb-2 mb-4"
        >
          {careCategories.map((category) => {
            const IconComponent = getLucideIcon(category.icon);

            return (
              <motion.button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                whileTap={tap}
                aria-pressed={selectedCategory === category.value}
                className={`chip ${selectedCategory === category.value ? 'chip-on' : ''}`}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{category.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Monthly Care Guides */}
        <div className="flex items-baseline gap-2 mb-4">
          <h2>按月齡照顧重點</h2>
          <span className="text-sm text-ink-muted">
            {'（共 '}
            {filteredGuides.length}
            {' 項）'}
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {/* Re-keying on the filter replays the stagger instead of silently
              swapping rows under the chip that was just tapped. */}
          <motion.div
            key={selectedCategory}
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {filteredGuides.map((guide) => (
              <motion.div
                key={guide.month}
                layout
                variants={listItem}
                className="card"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={
                      'w-12 h-12 rounded-full bg-secondary-dark flex items-center'
                      + ' justify-center flex-shrink-0 text-white font-bold text-sm'
                    }
                  >
                    {guide.month}
                    月
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <h3>{guide.title}</h3>
                    <span className={`tag ${getCategoryBadgeColor(guide.category)}`}>
                      {getCategoryLabel(guide.category)}
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 list-disc pl-5 marker:text-primary">
                  {guide.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-ink">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function GeneralSafety() {
  return (
    <>
      {/* General Safety Section */}
      <h2 className="mb-1">重點注意事項</h2>
      <p className="text-sm text-ink-muted mb-4">適用於所有階段的核心照顧原則</p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {generalSafetyItems.map((item) => {
          const IconComponent = getLucideIcon(item.icon);

          return (
            <motion.div key={item.id} variants={listItem} className="card">
              <div className="flex items-start gap-3">
                {IconComponent && (
                  <IconComponent className="w-5 h-5 text-primary-dark shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="mb-1">{item.title}</h3>
                  <p className="text-sm text-ink-muted">{item.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'physiological':
      return 'bg-secondary-light text-secondary-dark';
    case 'feeding':
      return 'bg-mint-light text-mint-dark';
    case 'safety':
      return 'bg-primary-light text-primary-dark';
    default:
      return 'bg-ink/5 text-ink-muted';
  }
};

const getCategoryLabel = (category: string) => {
  const cat = careCategories.find((c) => c.value === category);

  return cat ? cat.label : category;
};
