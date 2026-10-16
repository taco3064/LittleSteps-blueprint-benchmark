import { ClinicSummaryView10 } from './ClinicSummaryView10';
interface ClinicSummaryView9Props {
  growthRows: {
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
  }[];
}

export function ClinicSummaryView9({ growthRows }: ClinicSummaryView9Props) {
  return (
    <tbody>
      {growthRows.map((row, idx) => {
        const prev = idx > 0 ? growthRows[idx - 1] : undefined;

        return <ClinicSummaryView10 key={row.date} row={row} prev={prev} />;
      })}
    </tbody>
  );
}
