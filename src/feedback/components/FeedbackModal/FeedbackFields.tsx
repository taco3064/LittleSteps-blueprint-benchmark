import {
  CLAIM_NOT_PUBLISHED,
  type VenueReportTarget,
} from '~app/feedback/domain/venueReport';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

export function ReportContext({ target }: { target: VenueReportTarget }) {
  return (
    <div
      className={`mb-4 p-4 rounded-2xl ${SERVICE_THEME[target.service].tint}`}
    >
      <p className="text-sm font-semibold text-ink">{target.name}</p>
      <p className="text-xs text-ink-muted mt-0.5">{target.address}</p>
      <dl className="mt-2 space-y-1">
        {target.claims.map((claim) => (
          <div key={claim.label} className="flex gap-2 text-xs">
            <dt className="text-ink-faint shrink-0">{claim.label}</dt>
            <dd className="text-ink-muted">
              {claim.value ?? CLAIM_NOT_PUBLISHED}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-ink-faint mt-2 leading-relaxed">
        以上會跟著回報一起送出，你不用再打一次。
      </p>
    </div>
  );
}

export function ContactOptIn({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled: boolean;
}) {
  return (
    <label
      htmlFor="feedbackShareContact"
      className="card flex items-center gap-3 min-h-tap cursor-pointer"
    >
      <input
        id="feedbackShareContact"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 shrink-0 accent-primary-dark"
      />
      <span className="text-sm text-ink leading-relaxed">
        讓我們可以回覆你（會附上你的 Google 帳號名稱與 email）
      </span>
    </label>
  );
}
