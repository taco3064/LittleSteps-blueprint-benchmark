import { motion } from 'framer-motion';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { Gender } from '~app/family/domain/familyRecords';
import { listItem } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
const THEME = SERVICE_THEME.littlebloom;
interface BirthRegistrationProps {
  birthOpen: boolean;
  birthDate: string;
  lmp: string;
  setBirthDate: React.Dispatch<React.SetStateAction<string>>;
  birthGender: '' | Gender;
  setBirthGender: React.Dispatch<React.SetStateAction<'' | Gender>>;
  dateProblem: string | null;
  birthError: string;
  submitBirth: () => Promise<void>;
  birthSaving: boolean;
  setBirthOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BirthRegistration(props: BirthRegistrationProps) {
  return (
    <motion.section variants={listItem} className="panel">
      <h3 className={`mb-2 ${THEME.body}`}>寶寶出生了</h3>
      <p className={`text-sm leading-relaxed mb-4 ${THEME.muted}`}>
        填入實際出生日期後，這份檔案會變成寶寶檔案， LittleSteps 與 LittleExplorer
        就會依實際月齡接手。孕期與產檢紀錄都會保留。
      </p>

      {props.birthOpen
        ? (
            <div className="space-y-2">
              <label className={`block text-xs ${THEME.muted}`}>
                出生日期
                <input
                  type="date"
                  value={props.birthDate}
                  min={props.lmp || undefined}
                  max={toLocalDateKey()}
                  onChange={(e) => props.setBirthDate(e.target.value)}
                  className={
                    'mt-1 w-full px-3 min-h-tap rounded-xl border '
                    + 'border-bloom-sand text-sm text-bloom-stone-ink'
                  }
                />
              </label>
              <label className={`block text-xs ${THEME.muted}`}>
                性別（用來計算成長曲線百分位，可稍後補）
                <select
                  value={props.birthGender}
                  onChange={(e) => props.setBirthGender(e.target.value as Gender | '')}
                  className={
                    'mt-1 w-full px-3 min-h-tap rounded-xl border '
                    + 'border-bloom-sand text-sm text-bloom-stone-ink bg-white'
                  }
                >
                  <option value="">先不填</option>
                  <option value="male">男寶寶</option>
                  <option value="female">女寶寶</option>
                </select>
              </label>
              {(props.dateProblem ?? props.birthError) && (
                <p role="alert" className="text-sm text-red-600">
                  {props.dateProblem ?? props.birthError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={props.submitBirth}
                  disabled={props.birthSaving || props.dateProblem !== null}
                  className={`btn-primary flex-1 ${THEME.fill} ${THEME.fillText}`}
                >
                  {props.birthSaving ? '儲存中…' : '確認出生'}
                </button>
                <button
                  type="button"
                  onClick={() => props.setBirthOpen(false)}
                  disabled={props.birthSaving}
                  className="btn-ghost disabled:opacity-60"
                >
                  取消
                </button>
              </div>
            </div>
          )
        : (
            <button
              type="button"
              onClick={() => props.setBirthOpen(true)}
              className={`btn-primary ${THEME.fill} ${THEME.fillText}`}
            >
              登記出生
            </button>
          )}
    </motion.section>
  );
}
