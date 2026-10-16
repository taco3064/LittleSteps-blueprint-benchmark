import type { ReactNode } from 'react';
import { goTo } from '~app/portal/services/navigate';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import PregnancyGateView from '~app/littlesteps/components/PregnancyGate';

export default function PregnancyGate({
  currentChild, children,
}: {
  currentChild?: ChildProfile | null;
  children: ReactNode;
}) {
  if (!isPregnancyProfile(currentChild)) {
    return <>{children}</>;
  }

  return <PregnancyGateView onNavigate={() => goTo('littlebloom')} />;
}
