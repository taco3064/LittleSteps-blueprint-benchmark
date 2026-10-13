/**
 * Field limits for `feedbacks/$feedbackId`, copied from `database.rules.json`.
 *
 * One place, because two callers must agree with the rules and with each
 * other: the venue report clips the text it composes to these before writing,
 * and the general form caps its fields at them so nothing longer can be
 * typed. A string past a limit is rejected by the rule's `.validate`, and that
 * refusal reaches the client as the same PERMISSION_DENIED the throttle uses,
 * so a form that could exceed the limit would report a long bug report as
 * "you just sent one, try again shortly" on every retry.
 */
export const FEEDBACK_TITLE_LIMIT = 200;
export const FEEDBACK_CONTENT_LIMIT = 5000;
