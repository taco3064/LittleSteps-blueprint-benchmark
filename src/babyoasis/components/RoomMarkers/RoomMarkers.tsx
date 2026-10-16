import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import type { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { ROOM_ICON } from '../MapIcons';

export function RoomMarkers({
  rooms,
  onSelect,
}: {
  rooms: NursingRoom[];
  onSelect: (room: NursingRoom) => void;
}) {
  return useMemo(
    () =>
      rooms.map((room) => (
        <Marker
          key={room.id}
          position={[room.latitude, room.longitude]}
          icon={ROOM_ICON}
          eventHandlers={{ click: () => onSelect(room) }}
        />
      )),
    [rooms, onSelect],
  );
}
