import CrossWikiResultsView from '~app/portal/components/CrossWikiResults';
import type { ServiceTheme } from '~app/portal/components/ServiceTheme';
import { wikiSearchQuery } from '~app/portal/domain/crossWikiSearch';
import type { ServiceId } from '~app/portal/domain/serviceCatalogue';
import { useCrossWikiResults } from '~app/portal/hooks/useCrossWikiResults';
import { useNavigation } from '~app/portal/hooks/useNavigation';

export function CrossWikiResults({
  query,
  service,
  theme,
}: {
  query: string;
  service: ServiceId;
  theme: ServiceTheme;
}) {
  const result = useCrossWikiResults(query, service);
  const goTo = useNavigation();

  return (
    <CrossWikiResultsView
      {...result}
      theme={theme}
      onSelect={(hit) => goTo(hit.page, { search: wikiSearchQuery(query) })}
    />
  );
}
