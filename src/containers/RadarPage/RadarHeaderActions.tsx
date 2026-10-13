import AccountButton from '../AccountButton';
import AppHomeButton from '../AppHomeButton';

export const RadarHeaderActions = () => (
  <>
    <AccountButton
      service="littleguard"
      className="bg-guard-light hover:bg-guard/40 text-guard-ink"
    />
    <AppHomeButton className="bg-guard-light hover:bg-guard/40 text-guard-ink" />
  </>
);
