import { useEffect, useState } from 'react';
import { goTo, subscribeToNavigation } from '~app/domain/navigate';
import { pageFromPath, type Page } from '~app/domain/routes';
import { logPageView } from '~app/services/firebase';
import { useDocumentMeta } from '../useDocumentMeta';

export function usePageNavigation() {
  const [currentPage, setCurrentPage] = useState<Page>(() =>
    pageFromPath(window.location.pathname),
  );

  useEffect(
    () =>
      subscribeToNavigation(() => {
        setCurrentPage(pageFromPath(window.location.pathname));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }),
    [],
  );

  useDocumentMeta(currentPage);

  const navigateToPage = (page: Page) => {
    goTo(page);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    logPageView(page);
  };

  return { currentPage, navigateToPage };
}
