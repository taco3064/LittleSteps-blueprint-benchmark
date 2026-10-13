import { ALL_CITIES } from './outingOptions';

import type { OutingModel } from './useOutingModel';

export function OutingCities({ model }: { model: OutingModel }) {
  const { theme, cities, city, scrollerRef, selectedRef, chooseCity } = model;

  return (
    <div
      ref={scrollerRef}
      data-testid="scroll-row-outing-cities"
      className="row-bleed flex gap-2 pb-1"
    >
      {[ALL_CITIES, ...cities].map((value) => (
        <button
          key={value}
          ref={city === value ? selectedRef : undefined}
          type="button"
          onClick={() => chooseCity(value)}
          aria-pressed={city === value}
          className={`chip shrink-0 ${
            city === value
              ? `chip-on ${theme.fill} ${theme.fillText} border-transparent`
              : ''
          }`}
        >
          {value === ALL_CITIES ? '全部縣市' : value}
        </button>
      ))}
    </div>
  );
}
