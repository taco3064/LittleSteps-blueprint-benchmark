import EmptyState from '~app/components/EmptyState';
import NoChildNotice from '~app/components/NoChildNotice';
import {
  TODDLER_MIN_MONTHS,
} from '~app/domain/ageBands';
import { goTo } from '~app/domain/navigate';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

import type { DevelopmentModel } from './useDevelopmentModel';

const THEME = SERVICE_THEME.littleexplorer;

export function developmentEligibility(model: DevelopmentModel) {
  const { currentChild, onAddChild, onJoinChild, ageMonths, correcting } = model;

  return !currentChild
    ? (
        <NoChildNotice
          description="新增寶寶後，這裡就會依月齡顯示該階段的成長重點。"
          onAddChild={onAddChild}
          onJoinChild={onJoinChild}
        />
      )
    : isPregnancyProfile(currentChild)
      ? (
    // 孕期檔案的 birthday 是預產期，月齡會算成 0，若不先攔下來就會被
    // 誤導去 LittleSteps 追蹤一個還沒出生的孩子的里程碑。
          <EmptyState
            theme={THEME}
            title="這是孕期檔案"
            description={
              '目前選擇的是還沒出生的寶寶。\n孕期的產檢與每週指南在 LittleBloom；出生後在那裡登記出生日期，這裡就會接手。'
            }
            action={{
              label: '前往 LittleBloom',
              onClick: () => {
                goTo('littlebloom');
              },
            }}
          />
        )
      : ageMonths < TODDLER_MIN_MONTHS
        ? (
      // 這道門檻用的是矯正年齡，所以文案也要跟著講矯正年齡：對一個實際 13 個
      // 月、矯正 10 個月的早產寶寶說「還不到 1 歲」，是在講一件不是事實的事。
            <EmptyState
              theme={THEME}
              title={correcting ? '矯正年齡還不到 1 歲' : '寶寶還不到 1 歲'}
              description={
                correcting
                  ? '幼兒期的成長檢核從矯正年齡滿 1 歲開始，早產的週數已經扣掉了。\n'
                  + '在那之前，LittleSteps 的里程碑與副食品指南更適合現在的階段。'
                  : '幼兒期的成長追蹤從滿 1 歲開始。\n在那之前，LittleSteps 的里程碑與副食品指南更適合現在的階段。'
              }
              action={{
                label: '回 LittleSteps 追蹤里程碑',
                onClick: () => {
                  goTo('littlesteps/milestones');
                },
              }}
            />
          )
        : null;
}
