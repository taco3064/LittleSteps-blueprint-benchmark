import { useOptionalAuth } from '~app/platform/hooks/useAuth';
import AboutView from '~app/portal/components/AboutPage';
import { goTo } from '~app/portal/services/navigate';

export function AboutPage() {
  const auth = useOptionalAuth();

  return (
    <AboutView signedIn={auth?.user != null} onHome={() => goTo('home')} />
  );
}
