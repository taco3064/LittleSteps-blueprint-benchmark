import { useState } from 'react';
import { AddChildModal } from '~app/family';
import View, {
  type NoChildNoticeProps,
} from '~app/littleexplorer/components/NoChildNotice';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

export default function NoChildNotice(props: NoChildNoticeProps) {
  const [open, setOpen] = useState(false);
  const theme = SERVICE_THEME.littleexplorer;

  const modal = (
    <AddChildModal
      isOpen={open}
      onClose={() => setOpen(false)}
      modes={['create', 'join']}
      accent={theme.fill}
      accentText={theme.fillText}
      onJoin={props.onJoinChild}
      onSave={props.onAddChild}
    />
  );

  return <View {...props} onOpen={() => setOpen(true)} modal={modal} />;
}
