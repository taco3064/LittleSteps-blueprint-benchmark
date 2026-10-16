import { Baby, Flower2, MapPin, Shield, Sun, Trees } from 'lucide-react';
import type { ServiceId } from '~app/portal/domain/serviceCatalogue';
export const SERVICE_ICON = {
  littleguard: Shield,
  littlesteps: Baby,
  littlebloom: Flower2,
  littleexplorer: Sun,
  babyoasis: MapPin,
  littleouting: Trees,
};

export function ServiceIcon({ service }: { service: ServiceId }) {
  const Icon = SERVICE_ICON[service];

  return <Icon />;
}
