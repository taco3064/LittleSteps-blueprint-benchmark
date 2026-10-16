import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { formatDate } from '~app/platform/domain/calendar';
import { genderText } from '~app/littlesteps/domain/clinicSummary';
import { ClinicSummaryView4 } from './ClinicSummaryView4';
import { InfoItem } from './InfoItem';
interface ClinicSummaryView3Props {
  data: import('~app/littlesteps/domain/clinicSummary').ClinicSummaryData;
}

export function ClinicSummaryView3({ data }: ClinicSummaryView3Props) {
  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>寶寶基本資料</h2>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <InfoItem label="姓名" value={data.childName} />
        <InfoItem label="性別" value={genderText(data.gender)} />
        <InfoItem label="生日" value={formatDate(data.birthday)} />
        <InfoItem label="目前年齡" value={data.ageDisplay} />
        {data.gestationalAge && (
          <InfoItem label="出生週數" value={data.gestationalAge} />
        )}
        {data.correctedAgeDisplay && (
          <InfoItem label="矯正年齡" value={data.correctedAgeDisplay} />
        )}
      </div>

      {data.latestGrowth && <ClinicSummaryView4 data={data} />}
    </motion.section>
  );
}
