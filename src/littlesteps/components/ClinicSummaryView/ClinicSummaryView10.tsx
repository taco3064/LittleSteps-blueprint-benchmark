import { formatDate } from '~app/platform/domain/calendar';
import { TrendArrow } from './TrendArrow';
interface ClinicSummaryView10Props {
  row: {
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
  };
  prev:
    | { date: string; weight?: number; height?: number; headCircumference?: number }
    | undefined;
}

export function ClinicSummaryView10({ row, prev }: ClinicSummaryView10Props) {
  return (
    <tr key={row.date} className="border-b border-ink/5 last:border-0">
      <td className="py-2.5 pr-3 text-ink">{formatDate(row.date)}</td>
      <td className="py-2.5 pr-3 text-ink">
        {row.weight !== undefined
          ? (
              <span className="inline-flex items-center gap-1">
                {row.weight}
                {prev && <TrendArrow current={row.weight} previous={prev.weight} />}
              </span>
            )
          : (
              '--'
            )}
      </td>
      <td className="py-2.5 pr-3 text-ink">
        {row.height !== undefined
          ? (
              <span className="inline-flex items-center gap-1">
                {row.height}
                {prev && <TrendArrow current={row.height} previous={prev.height} />}
              </span>
            )
          : (
              '--'
            )}
      </td>
      <td className="py-2.5 text-ink">
        {row.headCircumference !== undefined
          ? (
              <span className="inline-flex items-center gap-1">
                {row.headCircumference}
                {prev && (
                  <TrendArrow
                    current={row.headCircumference}
                    previous={prev.headCircumference}
                  />
                )}
              </span>
            )
          : (
              '--'
            )}
      </td>
    </tr>
  );
}
