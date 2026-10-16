import { motion } from 'framer-motion';
import { Syringe } from 'lucide-react';
import { pressable } from '~app/platform/components/Pressable';
import { formatDate } from '~app/platform/domain/calendar';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { vaccineSchedules } from '~app/knowledge/domain/vaccines';
import {
  actionableVaccineDoses,
  resolveVaccineDoses,
} from '~app/family/domain/vaccineSchedule';

interface VaccineDueCardProps {
  child: ChildProfile;
  onOpen: () => void;
}

/**
 * 現在該打的疫苗。
 *
 * 32 劑裡有 22 劑落在 0-12 個月，但這一頁原本對疫苗一個字都沒提——疫苗頁是
 * 一份可以按月齡瀏覽的清單，家長得自己知道寶寶幾個月大、自己去翻。而幼兒期
 * 那邊只有 8 劑，卻早就有到期日與逾期提醒。這張卡片把同一件事帶回時程最密的
 * 那一年。
 *
 * 只顯示「已到期或已逾期且還沒打」的。列出未來六個月的每一劑等於沒有重點，
 * 而沒有任何一劑到期時就整張不出現——沒事的時候不該佔位置。
 */
export default function VaccineDueCard({ child, onOpen }: VaccineDueCardProps) {
  // 同一個 today 餵給兩邊：各自呼叫 new Date() 會在午夜前後算出不同的答案。
  const today = new Date();

  const due = actionableVaccineDoses(
    resolveVaccineDoses({
      birthday: child.birthday,
      schedules: vaccineSchedules,
      progress: child.vaccineProgress || {},
      today: today,
    }),
    today,
  );

  if (due.length === 0) {
    return null;
  }

  const overdue = due.filter((dose) => dose.status === 'overdue');

  return (
    <motion.div className="card card-tap mb-4" {...pressable(onOpen)}>
      <div className="flex items-start gap-3">
        <Syringe className="w-5 h-5 text-primary-dark shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="mb-1">
            {overdue.length > 0
              ? `有 ${overdue.length} 劑疫苗已過建議時間`
              : `該接種疫苗了`}
          </h3>
          <ul className="space-y-1">
            {due.slice(0, 3).map((dose) => (
              <li
                key={`${dose.vaccineId}-${dose.doseNumber}`}
                className="text-sm text-ink-muted"
              >
                {dose.name}
                <span className="text-ink-faint">
                  （
                  {dose.timing}
                  ／
                  {formatDate(dose.dueDate)}
                  ）
                </span>
              </li>
            ))}
          </ul>
          {due.length > 3 && (
            <p className="text-xs text-ink-faint mt-1">
              另有
              {due.length - 3}
              {' '}
              劑
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
