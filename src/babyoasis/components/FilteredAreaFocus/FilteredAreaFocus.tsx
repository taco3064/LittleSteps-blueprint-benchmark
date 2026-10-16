import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { NursingRoom } from '~app/babyoasis/domain/nursingRooms';
import { MARKER_ZOOM } from '../PointFocus';

/**
 * 篩選之後把地圖框到剩下的那些點上。
 *
 * 篩了「臺北市 士林區」卻還停在全台視角，家長看到的只是同一片叢集少了幾顆，
 * 得自己縮放拖曳去找篩選結果在哪裡。這裡直接算出剩下這些點的外接範圍飛過去，
 * 縣市與行政區因此不需要任何中心點座標表——資料本身就有座標。
 *
 * 每一批篩選結果只框一次，這是靠記住上一次框過的那個陣列做到的：篩選條件
 * 沒動、只是關掉了詳情面板時，地圖必須留在家長剛剛看的地方，不能把他拉回
 * 整區的視角。選定某一筆的期間也完全不動，那時 SelectedRoomFocus 正在把
 * 地圖帶到那一筆上，兩個都動會互相搶。
 *
 * maxZoom 用 MARKER_ZOOM，否則只剩一筆時會貼到最大倍率，家長認不出那是哪裡。
 */
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
