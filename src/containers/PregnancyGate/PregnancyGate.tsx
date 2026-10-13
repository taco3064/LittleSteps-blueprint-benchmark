import type { ReactNode } from 'react';
import type { ChildProfile } from '~app/domain/records';
import { isPregnancyProfile } from '~app/domain/pregnancy';
import { goTo } from '~app/domain/navigate';
import EmptyState from '~app/components/EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

const THEME = SERVICE_THEME.littlesteps;

/**
 * 擋住「對著孕期檔案記錄寶寶資料」。
 *
 * LittleSteps 這幾頁全部假設眼前是一個已經出生的寶寶，但選取中的檔案可以
 * 是孕期檔案——帳號視窗裡就能切換，切完只是把視窗關掉，畫面不動，只有頁首
 * 標題悄悄換了名字。家長以為還在看原本那個寶寶，一勾就把里程碑寫進胎兒的
 * 檔案裡，日期還早於預產期好幾個月。
 *
 * 而且救不回來：recordBirth 只把 isPregnancy 翻成 false，不會清掉期間寫進去
 * 的 milestoneProgress／vaccineProgress／growthRecords／dailyLogs，那些紀錄
 * 會一路留在真正出生後的檔案裡。資料庫規則也只檢查這個孩子屬不屬於你，
 * 不看檔案型別，所以伺服器端沒有第二道防線。
 *
 * LittleExplorer 的成長與提醒兩頁本來就這樣擋（DevelopmentPage、
 * RemindersPage），這裡只是把同一個判準補到 LittleSteps 會寫入的頁面上。
 */
export default function PregnancyGate({
  currentChild,
  children,
}: {
  currentChild?: ChildProfile | null;
  children: ReactNode;
}) {
  if (!isPregnancyProfile(currentChild)) {
    return <>{children}</>;
  }

  return (
    <div className="screen">
      <div className="screen-body">
        <EmptyState
          theme={THEME}
          title="這是孕期檔案"
          description={
            '目前選擇的是還沒出生的寶寶，這一頁記錄的是出生之後的事。\n孕期的產檢與每週指南在 LittleBloom；在那裡登記出生日期之後，這裡就會接手。'
          }
          action={{
            label: '前往 LittleBloom',
            onClick: () => {
              goTo('littlebloom');
            },
          }}
        />
      </div>
    </div>
  );
}
