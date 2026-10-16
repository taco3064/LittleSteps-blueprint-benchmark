export interface ViewPreferences {
  /** LittleGuard: the county whose board is shown. */
  guardCounty: string | null;
  /** LittleGuard: the age band chip, in the upstream `0~2` form. */
  guardAgeBand: string | null;
  /** LittleOuting: which of the three tabs. */
  outingTab: string | null;
  /** LittleOuting: the county chip, or the all-counties value. */
  outingCity: string | null;
  /** BabyOasis: the area filter. */
  oasisCity: string | null;
  oasisDistrict: string | null;
  /** BabyOasis: the venue-type chip. */
  oasisCategory: string | null;
  /** BabyOasis: hide rooms inside a workplace or a school. */
  oasisExcludeInternal: boolean;
}
