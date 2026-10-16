import { ClinicSummaryView9 } from './ClinicSummaryView9';
interface ClinicSummaryView8Props {
  growthRows: {
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
  }[];
}

export function ClinicSummaryView8({ growthRows }: ClinicSummaryView8Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-ink-muted border-b border-ink/10">
          <th className="pb-2 pr-3 font-medium">日期</th>
          <th className="pb-2 pr-3 font-medium">體重 (kg)</th>
          <th className="pb-2 pr-3 font-medium">身高 (cm)</th>
          <th className="pb-2 font-medium">頭圍 (cm)</th>
        </tr>
      </thead>
      <ClinicSummaryView9 growthRows={growthRows} />
    </table>
  );
}
