import { lazy } from 'react';
import type { ApplicationState } from '~app/hooks/useApplicationState';
const OutingPage = lazy(() => import('../OutingPage'));
const BabyOasisPage = lazy(() => import('../BabyOasisPage'));
const RadarPage = lazy(() => import('../RadarPage'));
const AboutPage = lazy(() => import('../AboutPage'));

export function PublicRoutes({ state }: { state: ApplicationState }) {
  const { currentPage } = state;

  return (
    <>
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'littleouting' && <OutingPage />}
      {currentPage === 'babyoasis' && <BabyOasisPage />}
      {currentPage === 'littleguard' && <RadarPage />}
    </>
  );
}
