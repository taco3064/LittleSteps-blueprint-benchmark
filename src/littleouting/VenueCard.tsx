import { formatDate } from '~app/platform/domain/calendar';
import { VenueReportButton } from '~app/feedback';
import VenueCardView from '~app/littleouting/components/VenueCard';
import type { Venue } from '~app/littleouting/domain/venueModels';

export function VenueCard({ venue }: { venue: Venue }) {
  const verifiedOn = formatDate(venue.verifiedOn);
  const needsBooking = venue.tags.includes('needsBooking');

  return (
    <VenueCardView
      venue={venue}
      report={(
        <VenueReportButton
          // -ml-4 吃掉 btn-ghost 自己的左內距，讓字對齊卡片的文字欄，
          // 而不是看起來縮進了一格。
          className="text-sm shrink-0 -ml-4"
          target={{
            service: 'littleouting',
            id: venue.id,
            name: venue.name,
            address: venue.address,
            claims: [
              // 名冊一處都沒有開放時間，18 個縣市全缺。回報要把這件事說出來，
              // 收件匣才分得清「時間寫錯了」和「我們根本沒有時間資料」。
              { label: '開放時間' },
              { label: '預約', value: needsBooking ? '需預約' : undefined },
              { label: '查證日期', value: verifiedOn },
            ],
          }}
        />
      )}
    />
  );
}
