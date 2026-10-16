import type { WikiArticle } from '~app/knowledge/domain/referenceModels';
import WikiBrowserView, {
  type WikiBrowserProps,
} from '~app/portal/components/WikiBrowser';
import { queryFromLocation } from '~app/portal/domain/crossWikiSearch';
import type { ServiceId } from '~app/portal/domain/serviceCatalogue';
import { CrossWikiResults } from './CrossWikiResults';

type Props<
  Category extends string,
  Article extends WikiArticle<Category>,
> = Omit<
  WikiBrowserProps<Category, Article>,
  'initialQuery' | 'crossResults'
> & {
  crossSearchService?: ServiceId;
};

export function WikiBrowser<
  Category extends string,
  Article extends WikiArticle<Category> = WikiArticle<Category>,
>({ crossSearchService, ...props }: Props<Category, Article>) {
  return (
    <WikiBrowserView
      {...props}
      initialQuery={queryFromLocation(window.location.search)}
      crossResults={
        crossSearchService
          ? (query) => (
              <CrossWikiResults
                query={query}
                service={crossSearchService}
                theme={props.theme}
              />
            )
          : undefined
      }
    />
  );
}
