import { motion } from 'framer-motion';
import { MapPin, Phone } from 'lucide-react';
import type { Venue } from '~app/littleouting/domain/venueModels';
import { tap } from '~app/platform/components/Motion';

export function VenueContact({ venue, mapsUrl }: { venue: Venue; mapsUrl: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <motion.a
        whileTap={tap}
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary flex-1 min-w-[8rem] text-sm"
      >
        <MapPin className="w-4 h-4" />
        地圖與導航
      </motion.a>
      {venue.phone && (
        <motion.a
          whileTap={tap}
          href={`tel:${venue.phone}`}
          className={
            'btn-secondary flex-1 min-w-[8rem] text-sm whi' + 'tespace-nowrap'
          }
        >
          <Phone className="w-4 h-4 shrink-0" />
          {venue.phone}
        </motion.a>
      )}
    </div>
  );
}
