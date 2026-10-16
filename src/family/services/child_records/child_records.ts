import { createAddChild } from '../add_child';
import { createJoinChild } from '../join_child';
import { createUpdateChild } from '../update_child';
import { createDeleteChild } from '../delete_child';
import { createReadChildExport } from '../read_child_export';
import { createDeleteAccountData } from '../delete_account_data';
import { createRevokeOtherMembers } from '../revoke_other_members';
import { createSetJoinOpen } from '../set_join_open';
import { createSetCurrentChild } from '../set_current_child';
import { createUpdateMilestoneProgress } from '../update_milestone_progress';
import { createUpdateVaccineProgress } from '../update_vaccine_progress';
import { createUpdateDevelopmentProgress } from '../update_development_progress';
import { createUpdateToothProgress } from '../update_tooth_progress';
import { createUpsertPrenatalRecord } from '../upsert_prenatal_record';
import { createClearPrenatalRecord } from '../clear_prenatal_record';
import { createRecordBirth } from '../record_birth';
import { createUpsertCareTaskRecord } from '../upsert_care_task_record';
import { createClearCareTaskRecord } from '../clear_care_task_record';
import { createAddDiaryEntry } from '../add_diary_entry';
import { createUpdateDiaryEntry } from '../update_diary_entry';
import { createDeleteDiaryEntry } from '../delete_diary_entry';
import { createAddDailyLog } from '../add_daily_log';
import { createUpdateDailyLog } from '../update_daily_log';
import { createDeleteDailyLog } from '../delete_daily_log';
import { createAddFoodTrial } from '../add_food_trial';
import { createUpdateFoodTrial } from '../update_food_trial';
import { createDeleteFoodTrial } from '../delete_food_trial';

export function createChildRecords(userId: string | null) {
  return {
    addChild: createAddChild(userId),
    joinChild: createJoinChild(userId),
    updateChild: createUpdateChild(userId),
    deleteChild: createDeleteChild(userId),
    readChildExport: createReadChildExport(userId),
    deleteAccountData: createDeleteAccountData(userId),
    revokeOtherMembers: createRevokeOtherMembers(userId),
    setJoinOpen: createSetJoinOpen(userId),
    setCurrentChild: createSetCurrentChild(userId),
    updateMilestoneProgress: createUpdateMilestoneProgress(userId),
    updateVaccineProgress: createUpdateVaccineProgress(userId),
    updateDevelopmentProgress: createUpdateDevelopmentProgress(userId),
    updateToothProgress: createUpdateToothProgress(userId),
    upsertPrenatalRecord: createUpsertPrenatalRecord(userId),
    clearPrenatalRecord: createClearPrenatalRecord(userId),
    recordBirth: createRecordBirth(userId),
    upsertCareTaskRecord: createUpsertCareTaskRecord(userId),
    clearCareTaskRecord: createClearCareTaskRecord(userId),
    addDiaryEntry: createAddDiaryEntry(userId),
    updateDiaryEntry: createUpdateDiaryEntry(userId),
    deleteDiaryEntry: createDeleteDiaryEntry(userId),
    addDailyLog: createAddDailyLog(userId),
    updateDailyLog: createUpdateDailyLog(userId),
    deleteDailyLog: createDeleteDailyLog(userId),
    addFoodTrial: createAddFoodTrial(userId),
    updateFoodTrial: createUpdateFoodTrial(userId),
    deleteFoodTrial: createDeleteFoodTrial(userId),
  };
}
