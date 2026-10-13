import { motion } from 'framer-motion';

import { genderText } from '~app/domain/clinicSummary';

import { formatDate } from '~app/domain/dateHelpers';

import { listItem } from '~app/domain/motion';
import { InfoItem, MeasurementCard } from './display';
import type { ClinicSummaryData } from '~app/domain/clinicSummary';

export default function ChildOverview({ data }: { data: ClinicSummaryData }) {
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

      {data.latestGrowth && (
        <div className="mt-5 pt-4 border-t border-ink/10">
          <p className="text-sm text-ink-muted mb-3">
            最新測量（
            {formatDate(data.latestGrowth.date)}
            ）
            {data.correctedAgeDisplay && '，百分位以矯正年齡計算'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {data.latestGrowth.weight !== undefined && (
              <MeasurementCard
                label="體重"
                value={`${data.latestGrowth.weight} kg`}
                percentile={data.latestGrowth.percentile?.weight}
              />
            )}
            {data.latestGrowth.height !== undefined && (
              <MeasurementCard
                label="身高"
                value={`${data.latestGrowth.height} cm`}
                percentile={data.latestGrowth.percentile?.height}
              />
            )}
            {data.latestGrowth.headCircumference !== undefined && (
              <MeasurementCard
                label="頭圍"
                value={`${data.latestGrowth.headCircumference} cm`}
                percentile={data.latestGrowth.percentile?.headCircumference}
              />
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
