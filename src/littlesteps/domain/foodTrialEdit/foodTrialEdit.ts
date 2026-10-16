import { changedFields } from '~app/platform/domain/firebaseData';
import type {
  FoodTrialInput,
  FoodTrialPatch,
  FoodTrialRecord,
} from '~app/family/domain/familyRecords';
import { trialDatePatch, trialDatesOf } from '../foodTrialDates';

/**
 * The fields FoodTrialModal actually holds.
 *
 * Derived from the submitted shape rather than listed against the record, so
 * a field added to `FoodTrialRecord` lands here too and stops the build at the
 * projection below until someone decides what an edit does with it. Listing
 * the names by hand made the opposite mistake cheap: the new field would just
 * never be diffed, and the parent would edit it and watch it not save.
 *
 * What is left out is the data layer's: `id` and `createdAt` are the record's
 * identity, and `updateFoodTrial` stamps its own `updatedAt`, so the form's is
 * at best noise and at worst an older clock. `trialDates` is not a scalar and
 * is handled on its own below.
 */
type FormFields = Omit<FoodTrialInput, 'trialDates' | 'updatedAt'>;

/**
 * The same fields with every key required, so the projection below has to
 * name all of them. An optional key would otherwise be legal to leave out of
 * the object literal, which is exactly how a new field ends up never diffed.
 * The values keep their `| undefined`: absent still means absent.
 */
type EveryFormField = { [K in keyof Required<FormFields>]: FormFields[K] };

const formFields = (record: FormFields): EveryFormField => ({
  foodName: record.foodName,
  category: record.category,
  firstTriedDate: record.firstTriedDate,
  hasAllergy: record.hasAllergy,
  allergyReactions: record.allergyReactions,
  preference: record.preference,
  notes: record.notes,
});

/**
 * What one edit of a food trial actually changed.
 *
 * `before` is the snapshot the form opened with, never the live store. The
 * form submits every field it holds, so writing that record back whole
 * overwrites whatever the other caregiver changed while the form sat open —
 * and overwrites it with values this parent read before their own edit
 * started. Diffing against the opening snapshot keeps a field nobody here
 * touched out of the patch, and `update()` then merges the two edits instead
 * of picking a winner. The live store is the wrong base for the same reason:
 * a stale form resending a field it never had would diff clean against it and
 * silently delete the other caregiver's change.
 *
 * A cleared field is `null`, not absent. `undefined` means "leave this one
 * alone", so omitting it leaves the old value in the database and hands the
 * parent back the note they just deleted.
 *
 * Two fields are not scalars:
 *
 * - `trialDates` is a set of days, one leaf per day, so it goes through
 *   {@link trialDatePatch}. Writing the object whole would erase a day the
 *   other caregiver recorded while this form was open (#89).
 * - `allergyReactions` stays one array leaf, the way `toUpdatePaths`
 *   documents, but it is compared structurally. `changedFields` compares
 *   arrays by identity, so an untouched list reports as a change and gets
 *   re-sent on every save — and because that leaf is replaced whole, the
 *   re-send takes out the reaction the other caregiver just added.
 */
export function foodTrialChanges(
  before: FoodTrialRecord,
  next: FoodTrialInput,
): FoodTrialPatch {
  // Cast: changedFields is a structural diff over `unknown`, so only the
  // caller knows which shape it just handed in. FoodTrialPatch holds the line.
  const patch = changedFields(
    formFields(before),
    formFields(next),
  ) as FoodTrialPatch;

  if (sameJson(before.allergyReactions ?? [], next.allergyReactions ?? [])) {
    delete patch.allergyReactions;
  }

  const dates = trialDatePatch(before.trialDates, trialDatesOf(next));

  if (Object.keys(dates).length > 0) {
    patch.trialDates = dates;
  }

  return patch;
}

/**
 * Structural equality for the JSON the database stores. A key holding
 * `undefined` and a key that is absent are the same thing here: the form sends
 * `description: undefined` for a blank reaction note, while the stored record
 * simply has no `description`.
 */
function sameJson(before: unknown, next: unknown): boolean {
  if (Object.is(before, next)) {
    return true;
  }

  if (Array.isArray(before) || Array.isArray(next)) {
    if (!Array.isArray(before) || !Array.isArray(next)) {
      return false;
    }

    return (
      before.length === next.length
      && before.every((item, i) => sameJson(item, next[i]))
    );
  }

  if (isObject(before) && isObject(next)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(next)]);

    return [...keys].every((key) => sameJson(before[key], next[key]));
  }

  return false;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
