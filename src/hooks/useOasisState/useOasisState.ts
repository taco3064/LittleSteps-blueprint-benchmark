import { useCallback, useState } from 'react';
import type { NursingRoom } from '~app/domain/records';
import { useOasisFilters } from '../useOasisFilters';
import { useOasisLocation } from '../useOasisLocation';
import { useOasisRooms } from '../useOasisRooms';

export function useOasisState() {
  const rooms = useOasisRooms();
  const location = useOasisLocation();

  const filtered = useOasisFilters(
    rooms.nursingRooms,
    rooms.filters,
    location.origin,
  );

  const [selectedRoom, setSelectedRoom] = useState<NursingRoom | null>(null);
  const closeRoom = useCallback(() => setSelectedRoom(null), []);

  return {
    ...rooms,
    ...location,
    ...filtered,
    selectedRoom,
    setSelectedRoom,
    closeRoom,
  };
}
