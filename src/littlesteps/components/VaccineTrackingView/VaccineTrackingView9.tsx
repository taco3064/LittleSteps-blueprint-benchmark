import { AnimatePresence } from 'framer-motion';
import { VaccineTrackingView10 } from './VaccineTrackingView10';
interface VaccineTrackingView9Props {
  showEmergencies: boolean;
  setShowEmergencies: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
}

export function VaccineTrackingView9({
  showEmergencies, setShowEmergencies,
}: VaccineTrackingView9Props) {
  return (
    <AnimatePresence>
      {showEmergencies && (
        <VaccineTrackingView10 setShowEmergencies={setShowEmergencies} />
      )}
    </AnimatePresence>
  );
}
