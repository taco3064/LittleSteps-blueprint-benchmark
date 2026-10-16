import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import type { useOutingState } from '~app/littleouting/hooks/useOutingState';

/** 縣市籌碼裡的「全部縣市」。 */
const ALL_CITIES = 'all';

export function OutingCityPicker({
  theme,
  cities,
  city,
  scrollerRef,
  selectedRef,
  chooseCity,
}: Pick<
  (ReturnType<typeof useOutingState> & { theme: ServiceTheme }),
  'theme' | 'cities' | 'city' | 'scrollerRef' | 'selectedRef' | 'chooseCity'
>) {
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
