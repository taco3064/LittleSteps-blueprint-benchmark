import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { formatDate } from '~app/platform/domain/calendar';
import type { Venue } from '~app/littleouting/domain/venueModels';
import { venueTagLabels } from '~app/littleouting/domain/venueTags';
import { listItem } from '~app/platform/components/Motion';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';
import { VenueContact } from '../VenueContact';

interface VenueCardProps {
  venue: Venue;
}

/**
 * 一家場館一張卡。
 *
 * 免點擊就看得到的東西，是照「哪個資訊沒有會讓一趟出門白跑」排的：費用與
 * 預約在最前面（訂不到位和低消算錯是家長最常抱怨的兩件事），接著是區域與
 * 設施，最後才是查證日期。
 *
 * 沒有照片。場館照片的著作權不在我們手上，放別人部落格的圖不合適，而放不
 * 準的示意圖比不放更糟。
 *
 * 標籤只列來源寫得出來的。缺一個標籤代表「來源沒寫」，不代表「沒有」——這
 * 和 BabyOasis 對 facilities 為 undefined 的處理是同一個原則。
 */
export default function VenueCard({
  venue,
  report,
}: VenueCardProps & { report: ReactNode }) {
  const theme = SERVICE_THEME.littleouting;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.name} ${venue.address}`,
  )}`;

  const isFree = venue.tags.includes('free');
  const needsBooking = venue.tags.includes('needsBooking');

  // 查證日期同時出現在卡片下緣與回報附帶的脈絡裡，兩處必須是同一個字串。
  const verifiedOn = formatDate(venue.verifiedOn);

  // 費用與預約自成一列，其餘設施才排進標籤區，否則最要緊的兩件事會被淹沒。
  const facilityTags = venue.tags.filter(
    (tag) => tag !== 'free' && tag !== 'needsBooking',
  );

  return (
    <motion.div variants={listItem} className="card">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-ink">{venue.name}</h3>
        {isFree
          ? (
              <span className={`tag shrink-0 ${theme.tint} ${theme.ink}`}>免費</span>
            )
          : (
              venue.minSpend !== undefined && (
                <span className="tag shrink-0 bg-butter-light text-butter-dark">
                  低消 $
                  {venue.minSpend}
                </span>
              )
            )}
      </div>

      <p className="text-sm text-ink-muted mb-2">
        {venue.city}
        {venue.district}
        {venue.ageYears && ` · 適合 ${venue.ageYears[0]}-${venue.ageYears[1]} 歲`}
      </p>

      {needsBooking && (
        <p className={`text-sm font-medium mb-2 ${theme.ink}`}>需預約</p>
      )}

      {facilityTags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-3">
          {facilityTags.map((tag) => (
            <li key={tag} className="tag bg-ink/5 text-ink-muted">
              {venueTagLabels[tag]}
            </li>
          ))}
        </ul>
      )}

      {venue.notes && (
        <p className="text-sm text-ink-muted leading-relaxed mb-3">{venue.notes}</p>
      )}

      <VenueContact venue={venue} mapsUrl={mapsUrl} />

      {/* 查證日期與「這裡的資訊不對？」是同一件事的兩面：一個說我們什麼時候
          問過，一個給家長回話的路。只有親子館掛得上——那份名冊是政府公開資料
          且沒有開放時間欄位，餐廳那份是我們逐家查證的。 */}
      <div
        className={
          'mt-3 flex flex-wrap items-center justify-betw' + 'een gap-x-3 gap-y-1'
        }
      >
        <p className="text-xs text-ink-faint">
          資料查證於
          {' '}
          {verifiedOn}
          ，出發前請再確認
        </p>
        {venue.kind === 'centre' && report}
      </div>
    </motion.div>
  );
}
