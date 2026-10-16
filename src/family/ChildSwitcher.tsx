import ChildSwitcherView from '~app/family/components/ChildSwitcher';
import {
  useChildSwitcher,
  type ChildSwitcherProps,
} from '~app/family/hooks/useChildSwitcher';

export function ChildSwitcher(props: ChildSwitcherProps) {
  const model = useChildSwitcher(props);

  if (!model) {
    return null;
  }

  return <ChildSwitcherView {...model} />;
}
