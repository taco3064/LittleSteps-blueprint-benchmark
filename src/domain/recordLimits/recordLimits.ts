/**
 * Length caps for the free-text fields a parent can type into a child's
 * records, copied from `database.rules.json`.
 *
 * Each `.validate` there rejects a string past its cap, and that refusal
 * reaches the client as PERMISSION_DENIED - the same error as a dropped
 * connection or a revoked membership. Every form here reports that as
 * "check your network" or prints the raw SDK string, and the parent retries
 * a write that can never succeed. A `maxLength` from this module keeps the
 * field from exceeding the rule in the first place, so a denial can only
 * mean what the form says it means.
 *
 * `maxLength` bounds what is typed or pasted, not what React pre-fills. A
 * value stored before the rules gained their caps, reopened for editing and
 * re-saved, still meets `.validate`; that is a data question, not a form one.
 *
 * `recordLimits.test.ts` reads the rules file and checks that every number
 * here is the one its rule enforces; change one side and the test says so.
 * The feedback form's caps live in `feedbackLimits.ts` and are not repeated
 * here.
 */

/** `children/$childId/name` - both the baby and the pregnancy form write it. */
export const CHILD_NAME_LIMIT = 40;

/** `childRecords/$childId/diaryEntries/$id/content` */
export const DIARY_CONTENT_LIMIT = 5000;

/** `childRecords/$childId/dailyLogs/$id/data/notes` */
export const DAILY_LOG_NOTES_LIMIT = 2000;

/** `childRecords/$childId/growthRecords/$id/notes` */
export const GROWTH_NOTES_LIMIT = 2000;

/** `children/$childId/prenatalProgress/$id/clinicName` */
export const PRENATAL_CLINIC_LIMIT = 100;

/** `children/$childId/prenatalProgress/$id/notes` */
export const PRENATAL_NOTES_LIMIT = 2000;

/** `children/$childId/careTaskProgress/$id/location` */
export const CARE_TASK_LOCATION_LIMIT = 100;

/** `children/$childId/careTaskProgress/$id/notes` */
export const CARE_TASK_NOTES_LIMIT = 2000;

/** `children/$childId/foodTrackingProgress/$id/foodName` */
export const FOOD_NAME_LIMIT = 100;

/** `children/$childId/foodTrackingProgress/$id/notes` */
export const FOOD_NOTES_LIMIT = 2000;

/** `children/$childId/foodTrackingProgress/$id/allergyReactions/$i/description` */
export const ALLERGY_DESCRIPTION_LIMIT = 500;
