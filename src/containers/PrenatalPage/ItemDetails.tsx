import { prenatalItemKindLabels } from '~app/domain/prenatalCheckups';
import type { ResolvedPrenatalItem } from '~app/domain/prenatalSchedule';

import { formatDate } from '~app/domain/dateHelpers';

import { THEME, KIND_STYLE } from './presentation';

export default function ItemDetails({
  item,
  beforeProfile,
}: {
  item: ResolvedPrenatalItem;
  beforeProfile: boolean;
}) {
  const { template, status } = item;

  return (
    <div className="flex items-start gap-3">
      <span className={`tag shrink-0 ${KIND_STYLE[template.kind]}`}>
        {prenatalItemKindLabels[template.kind]}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className={THEME.body}>
          {template.visitNumber ? `第 ${template.visitNumber} 次 · ` : ''}
          {template.title}
        </h3>
        <p className={`text-sm mt-0.5 ${THEME.muted}`}>
          {'建議第 '}
          {template.dueWeek}
          {' 週 · '}
          {formatDate(item.dueDate)}
          {!beforeProfile
            && status !== 'done'
            && (status === 'overdue'
              ? ` · 已超過建議週數 ${Math.abs(item.weeksUntilDue)} 週`
              : item.weeksUntilDue >= 0
                ? ` · 還有 ${item.weeksUntilDue} 週`
                : '')}
        </p>
        <p className={`text-sm mt-2 leading-relaxed ${THEME.body}`}>
          {template.description}
        </p>
        {item.completedDate && (
          <p className="text-sm text-bloom-sage-ink mt-2">
            {'已於 '}
            {formatDate(item.completedDate)}
            {' 完成'}
          </p>
        )}
      </div>
    </div>
  );
}
