import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MARKER_ZOOM } from './constants';

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
