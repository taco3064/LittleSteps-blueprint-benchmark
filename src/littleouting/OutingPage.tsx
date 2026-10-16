import { AccountButton } from '~app/account';
import { OutingView } from '~app/littleouting/components/OutingView';
import { useOutingState } from '~app/littleouting/hooks/useOutingState';
import { AppHomeButton } from '~app/portal';
import { VenueCard } from './VenueCard';

export default function OutingPage() {
  const state = useOutingState();

  return (
    <OutingView
      renderVenue={(venue) => <VenueCard key={venue.id} venue={venue} />}
      headerActions={(
        <>
          <AccountButton
            service="littleouting"
            className="bg-outing-light hover:bg-outing/40 text-outing-ink"
          />
          <AppHomeButton className="bg-outing-light hover:bg-outing/40 text-outing-ink" />
        </>
      )}
      {...state}
    />
  );
}
