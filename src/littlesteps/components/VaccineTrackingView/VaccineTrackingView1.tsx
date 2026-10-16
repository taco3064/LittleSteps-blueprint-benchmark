import { ChevronDown } from 'lucide-react';
import { pressable } from '~app/platform/components/Pressable';
import { VaccineTrackingView2 } from './VaccineTrackingView2';
interface VaccineTrackingView1Props {
  setShowReferences: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
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

export function VaccineTrackingView1({
  setShowReferences, showReferences, setShowEmergencies, setShowContraindications,
  setShowVaccineTypes, setShowGuidelines,
}: VaccineTrackingView1Props) {
  return (
    <div className="card p-0 overflow-hidden mb-4">
      <div
        className="flex items-center justify-between gap-2 px-4 min-h-tap"
        {...pressable(() => setShowReferences(!showReferences), showReferences)}
      >
        <span className="font-medium text-sm">參考資料</span>
        <ChevronDown
          className={`w-5 h-5 text-ink-faint transition-transform ${
            showReferences ? 'rotate-180' : ''
          }`}
        />
      </div>

      <VaccineTrackingView2
        showReferences={showReferences}
        setShowEmergencies={setShowEmergencies}
        setShowContraindications={setShowContraindications}
        setShowVaccineTypes={setShowVaccineTypes}
        setShowGuidelines={setShowGuidelines}
      />
    </div>
  );
}
