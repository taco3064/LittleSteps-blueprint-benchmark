import { Clock, MapPin, Phone } from 'lucide-react';
import { NursingRoom } from '~app/domain/records';
import { SERVICE_THEME } from '~app/domain/serviceTheme';

export function RoomContact({ room }: { room: NursingRoom }) {
  const theme = SERVICE_THEME.babyoasis;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-start gap-3">
        <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${theme.ink}`} />
        <div>
          <p className="text-ink">{room.address}</p>
          {room.floor && <p className="text-sm text-ink-muted">{room.floor}</p>}
        </div>
      </div>

      {room.openingHours && (
        <div className="flex items-start gap-3">
          <Clock className={`w-5 h-5 mt-0.5 shrink-0 ${theme.ink}`} />
          <p className="text-ink">{room.openingHours}</p>
        </div>
      )}

      {room.phone && (
        <div className="flex items-start gap-3">
          <Phone className={`w-5 h-5 mt-0.5 shrink-0 ${theme.ink}`} />
          <a href={`tel:${room.phone}`} className={`underline ${theme.ink}`}>
            {room.phone}
          </a>
        </div>
      )}
    </div>
  );
}
