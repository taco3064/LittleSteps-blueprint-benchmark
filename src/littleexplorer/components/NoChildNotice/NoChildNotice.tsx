import type { ChildFormValues } from '~app/family/domain/childForm';
import EmptyState from '~app/platform/components/EmptyState';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

export interface NoChildNoticeProps {
  /** 這一頁在沒有寶寶資料時該說什麼，語氣各頁不同。 */
  description: string;
  onAddChild: (child: ChildFormValues) => Promise<void>;
  onJoinChild?: (uuid: string) => Promise<void>;
}

/**
 * LittleExplorer 三個頁面共用的「還沒有寶寶資料」狀態，附自己的新增入口。
 *
 * 這三頁原本都寫「請先到 LittleSteps 新增寶寶」並把家長送走。孩子資料是跨
 * 服務共通的，但要求先進另一個服務才能開始用這一個，是把畫面也綁在一起了。
 * 表單仍然是共用的 AddChildModal，只是換成 LittleExplorer 的配色。
 */

interface ViewProps extends NoChildNoticeProps {
  onOpen: () => void;
  modal: React.ReactNode;
}

export default function NoChildNotice({ description, onOpen, modal }: ViewProps) {
  return (
    <>
      <EmptyState
        theme={SERVICE_THEME.littleexplorer}
        title="還沒有寶寶資料"
        description={description}
        action={{ label: '新增寶寶', onClick: onOpen }}
      />
      {modal}
    </>
  );
}
