import { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { USER_ICON } from './mapIcons';
export interface LocationMarkerProps {
  position: [number, number] | null;
}

export const LocationMarker = ({ position }: LocationMarkerProps) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1 });
    }
  }, [position, map]);

  if (!position) {
    return null;
  }

  return (
    <Marker position={position} icon={USER_ICON}>
      <Popup>你的位置</Popup>
    </Marker>
  );
};
