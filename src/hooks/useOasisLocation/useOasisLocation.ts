import { useCallback, useMemo, useState } from 'react';
import type { MrtStation } from '~app/domain/mrtStations';
import {
  GEOLOCATION_OPTIONS,
  GEOLOCATION_TIMEOUT,
  NEARBY_RADIUS_KM,
  STATION_RADIUS_KM,
} from '~app/domain/oasisFilters';
import { useToast } from '../useToast';

export function useOasisLocation() {
  const toast = useToast();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const [showNearby, setShowNearby] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  /*
    選定的捷運站是「定位點」而不是「篩選條件」：它不會拿掉任何一筆哺乳室，
    只是把附近清單與地圖的原點換成那一站。所以它不住在 RoomFilters 裡。

    和定位互斥，因為兩者都在回答「附近有什麼」，而答案只能有一個原點：選了站
    就以站為準，重新定位就把站放掉。留著兩個原點的話，清單標題與距離會各自
    指向不同的地方。
  */
  const [station, setStation] = useState<MrtStation | null>(null);

  /*
    附近清單與清單排序的原點。選定的捷運站優先於定位，因為它是家長剛剛按下去
    的那個動作；兩者都沒有就沒有原點，清單改用區域排序。
  */
  const origin = useMemo(() => {
    if (station) {
      return {
        lat: station.latitude,
        lng: station.longitude,
        radiusKm: STATION_RADIUS_KM,
        title: `捷運${station.name}站附近`,
        emptyText: `這一站 ${STATION_RADIUS_KM * 1000} 公尺內沒有已登記的哺乳室，可換一站或拖動地圖查看。`,
      };
    }

    if (userLocation) {
      return {
        lat: userLocation[0],
        lng: userLocation[1],
        radiusKm: NEARBY_RADIUS_KM,
        title: '附近的哺乳室',
        emptyText: `${NEARBY_RADIUS_KM} 公里內沒有已登記的哺乳室，可拖動地圖查看其他區域。`,
      };
    }

    return null;
  }, [station, userLocation]);

  const closeNearby = useCallback(() => setShowNearby(false), []);

  /* 選了站就開清單，取消就收起來——按下去之後畫面必須有反應。 */
  const handleStation = useCallback((next: MrtStation | null) => {
    setStation(next);
    setShowNearby(next !== null);
  }, []);

  const handleLocate = () => {
    if (!('geolocation' in navigator)) {
      toast.show('您的瀏覽器不支援定位功能');

      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;

        setUserLocation([latitude, longitude]);
        // 重新定位就放掉捷運站：兩者都是「附近」的原點，只能有一個。
        setStation(null);
        setShowNearby(true);
      },
      (error) => {
        setIsLocating(false);
        console.error('定位失敗:', error);

        toast.show(
          error.code === GEOLOCATION_TIMEOUT
            ? '定位逾時，室內收訊差時常會這樣，請靠近窗邊或到戶外再試一次'
            : '無法取得您的位置，請確認已開啟定位權限',
        );
      },
      GEOLOCATION_OPTIONS,
    );
  };

  return {
    userLocation,
    showNearby,
    isLocating,
    station,
    origin,
    closeNearby,
    handleStation,
    handleLocate,
  };
}
