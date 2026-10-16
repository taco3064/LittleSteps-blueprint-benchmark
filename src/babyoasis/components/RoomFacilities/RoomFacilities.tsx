import {
  Armchair,
  Baby,
  BedDouble,
  Droplet,
  MapPin,
  Microwave,
  Refrigerator,
  Wind,
  Zap,
} from 'lucide-react';
import { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

const getFacilityIcon = (facility: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    privateCurtain: <Baby className="w-4 h-4" />,
    nursingChair: <Armchair className="w-4 h-4" />,
    waterDispenser: <Droplet className="w-4 h-4" />,
    changingTable: <Baby className="w-4 h-4" />,
    washBasin: <Droplet className="w-4 h-4" />,
    refrigerator: <Refrigerator className="w-4 h-4" />,
    microwave: <Microwave className="w-4 h-4" />,
    airConditioning: <Wind className="w-4 h-4" />,
    babyBed: <BedDouble className="w-4 h-4" />,
    socket: <Zap className="w-4 h-4" />,
  };

  return iconMap[facility] || <MapPin className="w-4 h-4" />;
};

const getFacilityLabel = (facility: string): string => {
  const labelMap: { [key: string]: string } = {
    privateCurtain: '獨立空間',
    nursingChair: '哺乳椅',
    waterDispenser: '飲水機',
    changingTable: '尿布台',
    washBasin: '洗手台',
    refrigerator: '冰箱',
    microwave: '微波爐',
    airConditioning: '冷氣',
    babyBed: '嬰兒床',
    socket: '插座',
  };

  return labelMap[facility] || facility;
};

export function RoomFacilities({
  room,
  theme,
  availableFacilities,
}: {
  room: NursingRoom;
  theme: typeof SERVICE_THEME.babyoasis;
  availableFacilities: string[];
}) {
  return (
    <div className="mb-6">
      <h3 className="mb-3">設施</h3>
      {room.facilities
        ? (
            <div className="grid grid-cols-2 gap-2">
              {availableFacilities.map((facility) => (
                <div
                  key={facility}
                  className={
                    'flex items-center gap-2 p-3 bg-secondary-ligh' + 't rounded-xl'
                  }
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
