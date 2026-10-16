import { AccountButton } from '~app/account';
import Frame, { type BloomShellProps } from '~app/littlebloom/components/BloomShell';
import { AppHomeButton } from '~app/portal';
import { goTo } from '~app/portal/services/navigate';

export default function BloomShell(props: BloomShellProps) {
  return (
    <Frame
      {...props}
      onBack={props.backTo ? () => goTo(props.backTo!) : undefined}
      actions={(
        <>
          <AccountButton
            service="littlebloom"
            className={
              'bg-bloom-dusty-rose/15 hover:bg-bloom-dusty-rose/25 '
              + 'text-bloom-dusty-rose-ink'
            }
          />
          <AppHomeButton
            className={
              'bg-bloom-dusty-rose/15 hover:bg-bloom-dusty-rose/25 '
              + 'text-bloom-dusty-rose-ink'
            }
          />
        </>
      )}
    />
  );
}
