import { AccountButton } from '~app/account';
import { BabyOasisView } from '~app/babyoasis/components/BabyOasisView';
import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { ACCESS_LABEL, accessOf } from '~app/babyoasis/domain/roomCategory';
import { useBabyOasisState } from '~app/babyoasis/hooks/useBabyOasisState';
import { VenueReportButton } from '~app/feedback';
import { AppHomeButton } from '~app/portal';

export default function BabyOasisPage() {
  const state = useBabyOasisState();

  return (
    <BabyOasisView
      renderReport={renderRoomReport}
      headerActions={(
        <>
          <AccountButton service="babyoasis" />
          <AppHomeButton />
        </>
      )}
      {...state}
    />
  );
}

function renderRoomReport(room: NursingRoom, onOpenChange: (open: boolean) => void) {
  return (
    <VenueReportButton
      className="w-full mt-2"
      onOpenChange={onOpenChange}
      target={{
        service: 'babyoasis',
        id: room.id,
        name: room.name,
        address: room.address,
        claims: [
          { label: '開放時間', value: room.openingHours },
          // 使用條件是我們從場所名稱與注意事項推出來的，不是來源寫的。
          // 回報要把推論本身送出去，否則收件匣讀到「進不去」卻不知道我們
          // 原本猜的是哪一種。
          { label: '使用條件', value: ACCESS_LABEL[accessOf(room)] },
        ],
      }}
    />
  );
}
