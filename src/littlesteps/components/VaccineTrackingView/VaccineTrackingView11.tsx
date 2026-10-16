import { AnimatePresence } from 'framer-motion';
import { VaccineTrackingView12 } from './VaccineTrackingView12';
interface VaccineTrackingView11Props {
  showVaccineTypes: boolean;
  setShowVaccineTypes: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
}

export function VaccineTrackingView11({
  showVaccineTypes, setShowVaccineTypes,
}: VaccineTrackingView11Props) {
  return (
    <AnimatePresence>
      {showVaccineTypes && (
        <VaccineTrackingView12 setShowVaccineTypes={setShowVaccineTypes} />
      )}
    </AnimatePresence>
  );
}
