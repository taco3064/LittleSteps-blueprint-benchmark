import { ClinicSummaryView8 } from './ClinicSummaryView8';
interface ClinicSummaryView7Props {
  growthRows: {
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
  }[];
}

export function ClinicSummaryView7({ growthRows }: ClinicSummaryView7Props) {
  return (
    <div className="mt-4 overflow-x-auto">
      <ClinicSummaryView8 growthRows={growthRows} />
    </div>
  );
}
