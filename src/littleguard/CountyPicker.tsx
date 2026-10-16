import {
  hasGeolocationValue,
  requestCurrentPosition,
} from '~app/platform/services/geolocation';
import type { ComponentProps } from 'react';
import CountyPickerView from '~app/littleguard/components/CountyPicker';
import { nearestCounty } from '~app/littleguard/domain/countyCentroids';
import { useToast } from '~app/platform/hooks/useToast';

type Props = Omit<ComponentProps<typeof CountyPickerView>, 'onLocate'>;

export default function CountyPicker({ counties, selected, onSelect }: Props) {
  const toast = useToast();

  const locate = () => {
    // 用真值判斷而不是 `'geolocation' in navigator`：關掉定位的瀏覽器留著
    // 屬性但給 null，用 `in` 檢查會通過然後在下一行炸掉。
    const geolocationAvailable = hasGeolocationValue();

    if (!geolocationAvailable) {
      toast.show('您的瀏覽器不支援定位功能');

      return;
    }

    requestCurrentPosition(
      (position) => {
        const county = nearestCounty(
          position.coords.latitude,
          position.coords.longitude,
        );

        if (counties.includes(county)) {
          onSelect(county);
        } else {
          toast.show('找不到你所在縣市的資料');
        }
      },
      () => toast.show('沒辦法取得位置，請直接選縣市'),
    );
  };

  return (
    <CountyPickerView
      counties={counties}
      selected={selected}
      onSelect={onSelect}
      onLocate={locate}
    />
  );
}
