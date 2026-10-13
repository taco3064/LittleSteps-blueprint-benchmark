import {
  entryPageForChild,
  serviceForStage,
  stageOfChild,
} from '~app/domain/stageEntry';
import type { ApplicationState } from '~app/hooks/useApplicationState';
import LandingPage, { landingKindFor } from '../LandingPage';

export function ApplicationLanding({ state }: { state: ApplicationState }) {
  const {
    user,
    signInWithGoogle,
    childProfiles,
    currentChild,
    currentPage,
    navigateToPage,
  } = state;

  const landingKind = landingKindFor(
    currentPage,
    user,
    childProfiles.length > 0,
  );

  const landing = landingKind && (
    <LandingPage
      kind={landingKind}
      page={currentPage}
      user={user}
      hasChildren={childProfiles.length > 0}
      entryPage={entryPageForChild(currentChild)}
      currentService={serviceForStage(stageOfChild(currentChild))}
      onSignIn={signInWithGoogle}
      onNavigate={navigateToPage}
    />
  );

  return landing;
}
