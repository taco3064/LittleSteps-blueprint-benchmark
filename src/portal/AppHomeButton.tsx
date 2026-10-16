import HomeButton from '~app/portal/components/AppHomeButton';
import { goTo } from '~app/portal/services/navigate';

export function AppHomeButton({ className }: { className?: string }) {
  return <HomeButton className={className} onHome={() => goTo('home')} />;
}
