import type { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { AddChildModal } from '~app/family';
import { useOptionalChildStore } from '~app/family/hooks/useChildStoreContext';
import EmptyState from '~app/platform/components/EmptyState';
import HubLanding from '~app/portal/components/HubLanding';
import ServiceLanding from '~app/portal/components/ServiceLanding';
import StepsLanding from '~app/portal/components/StepsLanding';
import { serviceOf } from '~app/portal/domain/routePolicy';
import type { LandingKind } from '~app/portal/domain/landingPolicy';
import type { Page } from '~app/portal/domain/routes';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { type ServiceId } from '~app/portal/domain/serviceCatalogue';

/**
 * 「還沒有內容可看」的所有畫面，集中在這一支。
 *
 * 這些分支原本散在 App.tsx 三個地方加兩個 useEffect：未登入被擋下時挑一張
 * 介紹頁、`#/` 挑服務集合首頁、`#/littlesteps` 再依有沒有孩子分岔，而「登入
 * 後要去哪」同時寫在 App.tsx 與 StepsLanding 裡，兩者條件還不一致——一個
 * 要求已經有孩子，另一個不要求，於是剛註冊還沒建檔的人會被送進空的儀表板。
 * 規則收在這裡，就只有一個地方描述「什麼都還沒有的時候看到什麼」。
 */

interface LandingPageProps {
  kind: LandingKind;
  page: Page;
  user: User | null;
  hasChildren: boolean;
  /** 登入完成後要去的那一頁，依目前孩子的階段決定 */
  entryPage: Page;
  /** 入口頁用來標出「目前階段」的服務；沒有孩子時省略 */
  currentService?: ServiceId;
  onSignIn: () => Promise<void>;
  onNavigate: (page: Page) => void;
}

export default function LandingPage({
  kind,
  page,
  user,
  hasChildren,
  entryPage,
  currentService,
  onSignIn,
  onNavigate,
}: LandingPageProps) {
  const store = useOptionalChildStore();
  const [addingChild, setAddingChild] = useState(false);

  // 登入完成的瞬間帶去這個孩子該去的那一頁，但只在真的有孩子時——否則會落在
  // 一個沒有資料的頁面上，而不是「先新增寶寶」。用 ref 比對前一次的 user 才能
  // 區分「剛登入」與「本來就是登入狀態」。
  //
  // 原本寫死 littlesteps/dashboard，只看 hasChildren 這個布林值，所以只有
  // 孕期檔案的使用者登入後會落在嬰兒儀表板上。目的地現在由 App 依孩子的階段算出。
  const wasSignedIn = useRef(user !== null);

  useEffect(() => {
    if (!wasSignedIn.current && user && hasChildren) {
      onNavigate(entryPage);
    }

    wasSignedIn.current = user !== null;
  }, [user, hasChildren, entryPage, onNavigate]);

  if (kind === 'service-intro') {
    const service = serviceOf(page);

    // landingKindFor 只在這兩個服務回傳 service-intro。
    if (service === 'littlebloom' || service === 'littleexplorer') {
      return (
        <ServiceLanding
          service={service}
          onSignIn={onSignIn}
          onNavigate={onNavigate}
        />
      );
    }
  }

  if (kind === 'steps-intro') {
    return <StepsLanding onNavigate={onNavigate} onSignIn={onSignIn} />;
  }

  if (kind === 'hub') {
    return (
      <HubLanding
        onNavigate={onNavigate}
        user={user}
        onSignIn={onSignIn}
        currentService={currentService}
      />
    );
  }

  return (
    <div className="screen-body">
      <EmptyState
        theme={SERVICE_THEME.littlesteps}
        title="開始記錄寶寶的成長"
        description="先新增一個寶寶，即可開始追蹤里程碑、疫苗與日常照顧。"
        action={{ label: '新增寶寶', onClick: () => setAddingChild(true) }}
      />

      {/* 這顆按鈕原本只是打開側邊欄，而寶寶管理早就從側邊欄搬到每個 AppBar 的
          帳號按鈕底下了——於是剛註冊的家長按下引導流程唯一的那顆按鈕，得到
          一份導覽選單，裡面沒有任何地方可以新增寶寶。 */}
      <AddChildModal
        isOpen={addingChild}
        onClose={() => setAddingChild(false)}
        onSave={({ name, birthday, gender, dueDate, gestationalAge }) =>
          store?.addChild({ name, birthday, gender, dueDate, gestationalAge })}
        onJoin={store?.joinChild}
      />
    </div>
  );
}
