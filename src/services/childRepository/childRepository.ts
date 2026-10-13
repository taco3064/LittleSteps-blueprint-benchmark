import { addChildOperation } from './addChild';
import { addDailyLogOperation } from './addDailyLog';
import { addDiaryEntryOperation } from './addDiaryEntry';
import { addFoodTrialOperation } from './addFoodTrial';
import { clearCareTaskRecordOperation } from './clearCareTaskRecord';
import { clearPrenatalRecordOperation } from './clearPrenatalRecord';
import { deleteAccountDataOperation } from './deleteAccountData';
import { deleteChildOperation } from './deleteChild';
import { deleteDailyLogOperation } from './deleteDailyLog';
import { deleteDiaryEntryOperation } from './deleteDiaryEntry';
import { deleteFoodTrialOperation } from './deleteFoodTrial';
import { joinChildOperation } from './joinChild';
import { readChildExportOperation } from './readChildExport';
import { recordBirthOperation } from './recordBirth';
import { revokeOtherMembersOperation } from './revokeOtherMembers';
import { setCurrentChildOperation } from './setCurrentChild';
import { setJoinOpenOperation } from './setJoinOpen';
import { submitFeedbackOperation } from './submitFeedback';
import { updateChildOperation } from './updateChild';
import { updateDailyLogOperation } from './updateDailyLog';
import { updateDevelopmentProgressOperation } from './updateDevelopmentProgress';
import { updateDiaryEntryOperation } from './updateDiaryEntry';
import { updateFoodTrialOperation } from './updateFoodTrial';
import { updateMilestoneProgressOperation } from './updateMilestoneProgress';
import { updateToothProgressOperation } from './updateToothProgress';
import { updateVaccineProgressOperation } from './updateVaccineProgress';
import { upsertCareTaskRecordOperation } from './upsertCareTaskRecord';
import { upsertPrenatalRecordOperation } from './upsertPrenatalRecord';

export function createChildRepository(userId: string | null) {
  return {
    addChild: addChildOperation(userId),
    joinChild: joinChildOperation(userId),
    updateChild: updateChildOperation(userId),
    deleteChild: deleteChildOperation(userId),
    readChildExport: readChildExportOperation(userId),
    deleteAccountData: deleteAccountDataOperation(userId),
    revokeOtherMembers: revokeOtherMembersOperation(userId),
    setJoinOpen: setJoinOpenOperation(userId),
    setCurrentChild: setCurrentChildOperation(userId),
    updateMilestoneProgress: updateMilestoneProgressOperation(userId),
    updateVaccineProgress: updateVaccineProgressOperation(userId),
    updateDevelopmentProgress: updateDevelopmentProgressOperation(userId),
    updateToothProgress: updateToothProgressOperation(userId),
    upsertPrenatalRecord: upsertPrenatalRecordOperation(userId),
    clearPrenatalRecord: clearPrenatalRecordOperation(userId),
    recordBirth: recordBirthOperation(userId),
    upsertCareTaskRecord: upsertCareTaskRecordOperation(userId),
    clearCareTaskRecord: clearCareTaskRecordOperation(userId),
    addDiaryEntry: addDiaryEntryOperation(userId),
    updateDiaryEntry: updateDiaryEntryOperation(userId),
    deleteDiaryEntry: deleteDiaryEntryOperation(userId),
    addDailyLog: addDailyLogOperation(userId),
    updateDailyLog: updateDailyLogOperation(userId),
    deleteDailyLog: deleteDailyLogOperation(userId),
    addFoodTrial: addFoodTrialOperation(userId),
    updateFoodTrial: updateFoodTrialOperation(userId),
    deleteFoodTrial: deleteFoodTrialOperation(userId),
    submitFeedback: submitFeedbackOperation(userId),
  };
}
