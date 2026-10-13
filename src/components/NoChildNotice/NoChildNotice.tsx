import { useState } from 'react';
import type { Gender } from '~app/domain/records';
import type { GestationalAge } from '~app/domain/correctedAge';
import AddChildModal from '../AddChildModal';
import EmptyState from '../EmptyState';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

export interface AddChildInput {
  name: string;
  birthday: string;
  gender?: Gender;
  gestationalAge?: GestationalAge;
}

interface NoChildNoticeProps {
  /** 這一頁在沒有寶寶資料時該說什麼，語氣各頁不同。 */
  description: string;
  onAddChild: (input: AddChildInput) => Promise<void>;
  onJoinChild?: (uuid: string) => Promise<void>;
}

/**
 * LittleExplorer 三個頁面共用的「還沒有寶寶資料」狀態，附自己的新增入口。
 *
 * 這三頁原本都寫「請先到 LittleSteps 新增寶寶」並把家長送走。孩子資料是跨
 * 服務共通的，但要求先進另一個服務才能開始用這一個，是把畫面也綁在一起了。
 * 表單仍然是共用的 AddChildModal，只是換成 LittleExplorer 的配色。
 */
export default function NoChildNotice({
  description,
  onAddChild,
  onJoinChild,
}: NoChildNoticeProps) {
  const theme = SERVICE_THEME.littleexplorer;
  const [open, setOpen] = useState(false);

  return (
    <>
      <EmptyState
        theme={theme}
        title="還沒有寶寶資料"
        description={description}
        action={{ label: '新增寶寶', onClick: () => setOpen(true) }}
      />
      <AddChildModal
        isOpen={open}
        onClose={() => setOpen(false)}
        modes={['create', 'join']}
        accent={theme.fill}
        accentText={theme.fillText}
        // 直接把 promise 交給 AddChildModal：它會等寫入成功才關視窗。原本是
        // `then(() => setOpen(false))`，不論成敗都關——新增失敗的家長會以為
        // 寶寶建好了，回到同一張「還沒有寶寶資料」的畫面卻不知道為什麼。
        onJoin={onJoinChild}
        // 這個入口只傳寶寶資料，不提供孕期欄位。
        onSave={({ name, birthday, gender, gestationalAge }) =>
          onAddChild({ name, birthday, gender, gestationalAge })}
      />
    </>
  );
}
