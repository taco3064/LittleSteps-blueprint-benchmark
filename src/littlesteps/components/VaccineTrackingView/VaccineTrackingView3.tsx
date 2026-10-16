import { motion } from 'framer-motion';
import { AlertTriangle, BookOpen, Pill, ShieldAlert } from 'lucide-react';
import { collapse } from '~app/platform/components/Motion';
interface VaccineTrackingView3Props {
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

export function VaccineTrackingView3({
  setShowEmergencies, setShowContraindications, setShowVaccineTypes,
  setShowGuidelines,
}: VaccineTrackingView3Props) {
  return (
    <motion.div {...collapse} className="overflow-hidden">
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <button
          onClick={() => setShowEmergencies(true)}
          className="btn-secondary w-full text-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>緊急狀況處理</span>
        </button>
        <button
          onClick={() => setShowContraindications(true)}
          className="btn-secondary w-full text-sm"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>接種注意事項</span>
        </button>
        <button
          onClick={() => setShowVaccineTypes(true)}
          className="btn-secondary w-full text-sm"
        >
          <Pill className="w-4 h-4" />
          <span>疫苗種類說明</span>
        </button>
        <button
          onClick={() => setShowGuidelines(true)}
          className="btn-secondary w-full text-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>接種指南</span>
        </button>
      </div>
    </motion.div>
  );
}
