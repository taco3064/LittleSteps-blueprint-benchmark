import { NursingRoom } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import { getFacilityIcon, getFacilityLabel } from './facilities';

export function RoomFacilities({ room }: { room: NursingRoom }) {
  const theme = SERVICE_THEME.babyoasis;

  const availableFacilities = Object.entries(room.facilities ?? {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  return (
    <div className="mb-6">
      <h3 className="mb-3">設施</h3>
      {room.facilities
        ? (
            <div className="grid grid-cols-2 gap-2">
              {availableFacilities.map((facility) => (
                <div
                  key={facility}
                  className="flex items-center gap-2 p-3 bg-secondary-light rounded-xl"
                >
                  <span className={theme.ink}>{getFacilityIcon(facility)}</span>
                  <span className="text-sm text-ink">{getFacilityLabel(facility)}</span>
                </div>
              ))}
            </div>
          )
        : (
            <p className="text-sm text-ink-muted">
              此場所未提供設施明細，建議出發前先電話確認。
            </p>
          )}
    </div>
  );
}
