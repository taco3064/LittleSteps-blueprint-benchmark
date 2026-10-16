import { TODDLER_MIN_MONTHS } from '~app/family/domain/ageBands';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';
import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { goTo } from '~app/portal/services/navigate';
import NoChildNotice from './NoChildNotice';
import type { RemindersPageProps } from './RemindersPage';
type Options = RemindersPageProps & { ageMonths: number };
const THEME = SERVICE_THEME.littleexplorer;

export function reminderEligibility({
  currentChild,
  ageMonths,
  onAddChild,
  onJoinChild,
}: Options) {
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
