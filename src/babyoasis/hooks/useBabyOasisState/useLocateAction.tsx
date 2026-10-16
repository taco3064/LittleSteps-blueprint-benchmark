import {
  hasGeolocationProperty,
  requestCurrentPosition,
} from '~app/platform/services/geolocation';
import { useCallback } from 'react';
import type { useOasisSelection } from './useBabyOasisState';
import type { useOasisNearby } from './useOasisNearby';
import type { useOasisRooms } from './useOasisRooms';

/**
 * 定位選項。不給 options 時 timeout 預設是 Infinity：室內收不到 GPS 的話
 * callback 永遠不會回來，家長看到的只有一顆轉不停的鈕。十秒沒結果就當作失敗
 * 講出來，比無聲的等待有用。
 *
 * maximumAge 讓一分鐘內的座標可以直接沿用，連按不必重新定位；哺乳室以街廓為
 * 單位，不值得用 enableHighAccuracy 換耗電與額外的等待。
 */
const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 60_000,
  enableHighAccuracy: false,
};

/** GeolocationPositionError.TIMEOUT。逾時和被拒絕權限要講不一樣的話。 */
const GEOLOCATION_TIMEOUT = 3;

export function useLocateAction({
  toast,
  setUserLocation,
  setShowNearby,
  setIsLocating,
  setStation,
}: ReturnType<typeof useOasisSelection>
  & ReturnType<typeof useOasisRooms>
  & ReturnType<typeof useOasisNearby>) {
  const handleLocate = useCallback(() => {
    if (!hasGeolocationProperty()) {
      toast.show('您的瀏覽器不支援定位功能');

      return;
    }

    setIsLocating(true);

    requestCurrentPosition(
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
  }, [toast, setUserLocation, setShowNearby, setIsLocating, setStation]);

  return { handleLocate };
}
