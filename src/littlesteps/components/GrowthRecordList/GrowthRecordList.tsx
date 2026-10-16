import { GrowthRecord } from '~app/family/domain/familyRecords';
import { getPercentileCategory } from '~app/littlesteps/domain/growthCalculator';
import {
  GrowthRecordListPresentation,
  GrowthRecordListPresentation1,
  GrowthRecordListPresentation2,
} from './GrowthRecordListPresentation';

interface GrowthRecordListProps {
  records: GrowthRecord[];
  loading: boolean;
  onEdit: (record: GrowthRecord) => void;
  onDelete: (recordId: string) => Promise<void>;
}

export default function GrowthRecordList({
  records, loading, onEdit, onDelete,
}: GrowthRecordListProps) {
  const getPercentileColor = (percentile?: number): string => {
    if (!percentile) {
      return 'text-ink-faint';
    }

    const category = getPercentileCategory(percentile);

    if (category === 'low') {
      return 'text-butter-dark';
    }

    if (category === 'high') {
      return 'text-secondary-dark';
    }

    return 'text-mint-dark';
  };

  if (loading) {
    return <GrowthRecordListPresentation />;
  }

  if (records.length === 0) {
    return <GrowthRecordListPresentation1 />;
  }

  return (
    <GrowthRecordListPresentation2
      records={records}
      onEdit={onEdit}
      handleDelete={onDelete}
      getPercentileColor={getPercentileColor}
    />
  );
}
