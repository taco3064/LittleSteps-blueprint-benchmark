import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import { restaurants } from '~app/littleouting/domain/restaurants';

import type { useOutingState } from '~app/littleouting/hooks/useOutingState';

export function OutingRestaurantNotice({
  theme,
}: Pick<(ReturnType<typeof useOutingState> & { theme: ServiceTheme }), 'theme'>) {
  return (
    <div className={`panel ${theme.tint}`}>
      <h2 className={`mb-1 ${theme.ink}`}>這是精選，不是完整名單</h2>
      <p className="text-sm text-ink-muted leading-relaxed">
        全台沒有官方的親子餐廳名單，也沒有任何認證制度，所以這裡是
        {restaurants.length}
        {' '}
        家逐家查證過的餐廳。餐廳會改時間、改低消、也會倒，
        每張卡片都標了查證日期，出發前請再確認一次。
      </p>
    </div>
  );
}
