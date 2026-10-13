import { motion } from 'framer-motion';

import { formatDate } from '~app/domain/dateHelpers';

import { listItem } from '~app/domain/motion';
import { TrendArrow } from './display';
import type { ClinicSummaryData } from '~app/domain/clinicSummary';

export default function GrowthHistory({ data }: { data: ClinicSummaryData }) {
  const growthRows = [...data.recentGrowthRecords].reverse();

  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>成長趨勢</h2>

      {growthRows.length === 0
        ? (
            <p className="text-ink-muted text-sm mt-4">尚無成長紀錄</p>
          )
        : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-muted border-b border-ink/10">
                    <th className="pb-2 pr-3 font-medium">日期</th>
                    <th className="pb-2 pr-3 font-medium">體重 (kg)</th>
                    <th className="pb-2 pr-3 font-medium">身高 (cm)</th>
                    <th className="pb-2 font-medium">頭圍 (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {growthRows.map((row, idx) => {
                    const prev = idx > 0 ? growthRows[idx - 1] : undefined;

                    return (
                      <tr
                        key={row.date}
                        className="border-b border-ink/5 last:border-0"
                      >
                        <td className="py-2.5 pr-3 text-ink">
                          {formatDate(row.date)}
                        </td>
                        <td className="py-2.5 pr-3 text-ink">
                          {row.weight !== undefined
                            ? (
                                <span className="inline-flex items-center gap-1">
                                  {row.weight}
                                  {prev && (
                                    <TrendArrow
                                      current={row.weight}
                                      previous={prev.weight}
                                    />
                                  )}
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
                                  {prev && (
                                    <TrendArrow
                                      current={row.height}
                                      previous={prev.height}
                                    />
                                  )}
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
                  })}
                </tbody>
              </table>
            </div>
          )}
    </motion.section>
  );
}
