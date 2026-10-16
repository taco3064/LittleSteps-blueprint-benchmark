import AddChildModalView from '~app/family/components/AddChildModal';
import {
  useAddChildModal,
  type AddChildModalProps,
} from '~app/family/hooks/useAddChildModal';

export function AddChildModal(props: AddChildModalProps) {
  const model = useAddChildModal(props);

  if (!model) {
    return null;
  }

  return <AddChildModalView {...model} />;
}
