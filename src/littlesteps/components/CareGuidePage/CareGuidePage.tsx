import { useMemo, useState } from 'react';
import { CareGuideView } from '../CareGuideView';
import {
  careCategories,
  monthlyCareGuides,
} from '~app/littlesteps/domain/careGuides';

export default function CareGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredGuides = useMemo(() => {
    if (selectedCategory === 'all') {
      return monthlyCareGuides;
    }

    return monthlyCareGuides.filter((guide) => guide.category === selectedCategory);
  }, [selectedCategory]);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'physiological':
        return 'bg-secondary-light text-secondary-dark';
      case 'feeding':
        return 'bg-mint-light text-mint-dark';
      case 'safety':
        return 'bg-primary-light text-primary-dark';
      default:
        return 'bg-ink/5 text-ink-muted';
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = careCategories.find((c) => c.value === category);

    return cat ? cat.label : category;
  };

  return (
    <CareGuideView
      setSelectedCategory={setSelectedCategory}
      selectedCategory={selectedCategory}
      filteredGuides={filteredGuides}
      getCategoryBadgeColor={getCategoryBadgeColor}
      getCategoryLabel={getCategoryLabel}
    />
  );
}
