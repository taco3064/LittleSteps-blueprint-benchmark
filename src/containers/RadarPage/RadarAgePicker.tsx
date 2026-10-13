import {
  AGE_LABEL,
} from '~app/domain/radar';

import type { RadarModel } from './useRadarModel';

export function RadarAgePicker({ model }: { model: RadarModel }) {
  const { theme, data, age, scrollerRef, selectedRef, chooseAge } = model;

  if (!data) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-ink-muted">孩子的年齡</h2>
      {/* data-testid：這一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的水平
                  溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
      <div
        ref={scrollerRef}
        data-testid="scroll-row-guard-age-bands"
        className="row-bleed flex gap-2 py-1"
      >
        {data.ageBands.map((band) => {
          const isSelected = band === age;

          return (
            <button
              key={band}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => chooseAge(band)}
              aria-pressed={isSelected}
              // 同 CountyPicker：蓋掉 .chip-on 的珊瑚紅，換服務自己的靖藍。
              className={`chip shrink-0 ${
                isSelected
                  ? `chip-on ${theme.fill} ${theme.fillText} border-transparent`
                  : ''
              }`}
            >
              {AGE_LABEL[band] ?? band}
            </button>
          );
        })}
      </div>
    </section>
  );
}
