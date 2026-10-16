import { formatDate } from '~app/platform/domain/calendar';
import type {
  PrenatalCheckupTemplate,
  PrenatalItemKind,
} from '~app/knowledge/domain/prenatalCheckups';
import { prenatalItemKindLabels } from '~app/knowledge/domain/prenatalCheckups';
import type { ScheduleStatus } from '~app/knowledge/domain/scheduleStatus';
import type { ResolvedPrenatalItem } from '~app/littlebloom/domain/prenatalSchedule';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littlebloom;

const KIND_STYLE: Record<PrenatalItemKind, string> = {
  checkup: 'bg-bloom-dusty-rose/15 text-bloom-dusty-rose-ink',
  ultrasound: 'bg-bloom-dusty-blue/20 text-bloom-dusty-blue-ink',
  screening: 'bg-bloom-sage/20 text-bloom-sage-ink',
  vaccine: 'bg-bloom-mauve/20 text-bloom-mauve-ink',
};

interface PrenatalItemSummaryProps {
  template: PrenatalCheckupTemplate;
  item: ResolvedPrenatalItem;
  beforeProfile: boolean;
  status: ScheduleStatus;
}

export default function PrenatalItemSummary({
  template,
  item,
  beforeProfile,
  status,
}: PrenatalItemSummaryProps) {
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
          建議第
          {' '}
          {template.dueWeek}
          {' '}
          週 ·
          {' '}
          {formatDate(item.dueDate)}
          {/* 落後幾週只講給真正過期的那幾項。狀態是 due 的還在可做的區間，
                  掛在「現在可以做」底下說它超過建議週數會自相矛盾。 */}
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
            已於
            {' '}
            {formatDate(item.completedDate)}
            {' '}
            完成
          </p>
        )}
      </div>
    </div>
  );
}
