import ShareChildUuidModalView from '~app/family/components/ShareChildUuidModal';
import {
  useShareChildUuidModal,
  type ShareChildUuidModalProps,
} from '~app/family/hooks/useShareChildUuidModal';

export function ShareChildUuidModal(props: ShareChildUuidModalProps) {
  const model = useShareChildUuidModal(props);

  if (!model) {
    return null;
  }

  return <ShareChildUuidModalView {...model} />;
}
