import { vaccineTypes } from '~app/knowledge/domain/vaccines';
import { Sheet } from './Sheet';
import { VaccineTrackingView13 } from './VaccineTrackingView13';
interface VaccineTrackingView12Props {
  setShowVaccineTypes: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
}

export function VaccineTrackingView12({
  setShowVaccineTypes,
}: VaccineTrackingView12Props) {
  return (
    <Sheet title="疫苗種類說明" onClose={() => setShowVaccineTypes(false)}>
      {vaccineTypes.map((type, idx) => (
        <VaccineTrackingView13 key={idx} idx={idx} type={type} />
      ))}
    </Sheet>
  );
}
