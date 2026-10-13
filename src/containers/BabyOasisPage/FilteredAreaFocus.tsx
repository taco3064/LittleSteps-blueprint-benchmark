import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { NursingRoom } from '~app/domain/records';
import { MARKER_ZOOM } from './constants';

export const FilteredAreaFocus = ({
  rooms,
  active,
}: {
  rooms: readonly NursingRoom[];
  active: boolean;
}) => {
  const map = useMap();
  const framed = useRef<readonly NursingRoom[] | null>(null);

  useEffect(() => {
    if (rooms === framed.current) {
      return;
    }

    framed.current = rooms;

    if (!active || rooms.length === 0) {
      return;
    }

    let south = rooms[0].latitude;
    let north = south;
    let west = rooms[0].longitude;
    let east = west;

    rooms.forEach((room) => {
      if (room.latitude < south) {
        south = room.latitude;
      }

      if (room.latitude > north) {
        north = room.latitude;
      }

      if (room.longitude < west) {
        west = room.longitude;
      }

      if (room.longitude > east) {
        east = room.longitude;
      }
    });

    map.fitBounds(
      [
        [south, west],
        [north, east],
      ],
      // 上緣要留給標題列與搜尋列，它們是浮在地圖上的。
      {
        paddingTopLeft: [24, 180],
        paddingBottomRight: [24, 48],
        maxZoom: MARKER_ZOOM,
      },
    );
  }, [rooms, active, map]);

  return null;
};
