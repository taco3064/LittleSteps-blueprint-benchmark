import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * 個別標記出現的倍率。同一個值同時給 disableClusteringAtZoom 與選定後的飛行
 * 目標用：飛到比它更遠的倍率，那一筆會被併回叢集裡，家長點了卻看不到自己選的點。
 */
export const MARKER_ZOOM = 16;

/**
 * 選定的目標把地圖帶過去——一筆哺乳室，或一個捷運站。
 *
 * MapContainer 的 center/zoom 只是初始值，之後改它不會動；要移動地圖只能像
 * LocationMarker 那樣拿 useMap 的實例。掛在選取本身而不是另開一個「搜尋選中
 * 的那筆」狀態：一個選取只該有一種地圖反應，搜尋結果、附近清單、直接點標記
 * 三條路徑因此完全一致。
 *
 * 只放大不縮小（Math.max）：已經放大到街道層的家長不該因為點一筆而被拉遠。
 */
export const PointFocus = ({
  point,
}: {
  point: { latitude: number; longitude: number } | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!point) {
      return;
    }

    map.flyTo(
      [point.latitude, point.longitude],
      Math.max(map.getZoom(), MARKER_ZOOM),
      {
        duration: 1,
      },
    );
  }, [point, map]);

  return null;
};
