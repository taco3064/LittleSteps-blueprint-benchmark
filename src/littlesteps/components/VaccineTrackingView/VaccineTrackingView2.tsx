import { AnimatePresence } from 'framer-motion';
import { VaccineTrackingView3 } from './VaccineTrackingView3';
interface VaccineTrackingView2Props {
  showReferences: boolean;
  setShowEmergencies: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowContraindications: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowVaccineTypes: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowGuidelines: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
}

export function VaccineTrackingView2({
  showReferences, setShowEmergencies, setShowContraindications, setShowVaccineTypes,
  setShowGuidelines,
}: VaccineTrackingView2Props) {
  return (
    <AnimatePresence initial={false}>
      {showReferences && (
        <VaccineTrackingView3
          setShowEmergencies={setShowEmergencies}
          setShowContraindications={setShowContraindications}
          setShowVaccineTypes={setShowVaccineTypes}
          setShowGuidelines={setShowGuidelines}
        />
      )}
    </AnimatePresence>
  );
}
