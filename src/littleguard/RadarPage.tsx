import CountyPicker from './CountyPicker';
import { AccountButton } from '~app/account';
import { RadarView } from '~app/littleguard/components/RadarView';
import { useRadarState } from '~app/littleguard/hooks/useRadarState';
import { AppHomeButton } from '~app/portal';

export default function RadarPage() {
  const state = useRadarState();

  return (
    <RadarView
      onOpenStatistics={() => window.open(
        'https://nidss.cdc.gov.tw/', '_blank', 'noreferrer',
      )}
      countyPicker={(
        <CountyPicker
          counties={state.counties}
          selected={state.county}
          onSelect={state.chooseCounty}
        />
      )}
      headerActions={(
        <>
          <AccountButton
            service="littleguard"
            className="bg-guard-light hover:bg-guard/40 text-guard-ink"
          />
          <AppHomeButton className="bg-guard-light hover:bg-guard/40 text-guard-ink" />
        </>
      )}
      {...state}
    />
  );
}
