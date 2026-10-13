import {
  CENTRE_ACCESS_UNVERIFIED,
} from '~app/domain/centreAccess';

import type { OutingModel } from './useOutingModel';

export function OutingAccess({ model }: { model: OutingModel }) {
  const { theme, city, access } = model;

  return (
    <div className="card bg-white">
      <h3 className={`mb-2 ${theme.ink}`}>
        {city}
        的使用規則
      </h3>
      {access
        ? (
            <dl className="space-y-1.5 text-sm">
              {(
                [
                  ['費用', access.fee],
                  ['年齡對象', access.ageLimit],
                  ['預約方式', access.booking],
                  ['戶籍限制', access.residency],
                ] as const
              ).map(([label, rule]) => (
                <div key={label} className="flex gap-2">
                  <dt className="text-ink-muted shrink-0">{label}</dt>
                  <dd className="text-ink">{rule.value}</dd>
                </div>
              ))}
              {access.notes && (
                <p className="text-ink-muted leading-relaxed pt-1">
                  {access.notes}
                </p>
              )}
            </dl>
          )
        : (
            <p className="text-sm text-ink-muted">
              {CENTRE_ACCESS_UNVERIFIED}
            </p>
          )}
    </div>
  );
}
