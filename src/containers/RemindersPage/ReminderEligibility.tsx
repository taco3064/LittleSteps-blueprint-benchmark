import EmptyState from '~app/components/EmptyState';
import NoChildNotice from '~app/components/NoChildNotice';
import { TODDLER_MIN_MONTHS } from '~app/domain/ageBands';
import { goTo } from '~app/domain/navigate';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

/*
 * 逾期是唯一需要靠卡片本身喊出來的狀態，所以只有它帶顏色與框線。
 * 這一區只放建檔之後才到期的項目；建檔前就到期的另外收在下方的收合區。
 */

import type { ReminderModel } from './useReminderModel';

const THEME = SERVICE_THEME.littleexplorer;

export function reminderEligibility(model: ReminderModel) {
  const { currentChild, onAddChild, onJoinChild, ageMonths } = model;

  return !currentChild
    ? (
        <NoChildNotice
          description="新增寶寶後，提醒會依出生日自動算出健檢、疫苗與塗氟的時程。"
          onAddChild={onAddChild}
          onJoinChild={onJoinChild}
        />
      )
    : isPregnancyProfile(currentChild)
      ? (
          <EmptyState
            theme={THEME}
            title="這是孕期檔案"
            description={
              '目前選擇的是還沒出生的寶寶。\n產檢時程在 LittleBloom；出生後在那裡登記出生日期，幼兒期的提醒就會接手。'
            }
            action={{
              label: '前往 LittleBloom 產檢時程',
              onClick: () => {
                goTo('littlebloom/prenatal');
              },
            }}
          />
        )
      : ageMonths < TODDLER_MIN_MONTHS
        ? (
            <EmptyState
              theme={THEME}
              title="寶寶還不到 1 歲"
              description={
                '幼兒期的提醒從滿 1 歲開始。\n1 歲前的疫苗與健檢請在 LittleSteps 的疫苗追蹤查看。'
              }
              action={{
                label: '回 LittleSteps 疫苗追蹤',
                onClick: () => {
                  goTo('littlesteps/vaccine-tracking');
                },
              }}
            />
          )
        : null;
}
