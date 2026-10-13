import { addChildAction } from './addChild';
import { addDiaryEntryAction } from './addDiaryEntry';
import { clearCareTaskRecordAction } from './clearCareTaskRecord';
import { clearPrenatalRecordAction } from './clearPrenatalRecord';
import { deleteAccountDataAction } from './deleteAccountData';
import { deleteChildAction } from './deleteChild';
import { deleteDiaryEntryAction } from './deleteDiaryEntry';
import { joinChildAction } from './joinChild';
import { recordBirthAction } from './recordBirth';
import { revokeOtherMembersAction } from './revokeOtherMembers';
import { setCurrentChildAction } from './setCurrentChild';
import { setJoinOpenAction } from './setJoinOpen';
import { setVaccineDoseAction } from './setVaccineDose';
import { toggleDevelopmentCheckAction } from './toggleDevelopmentCheck';
import { toggleMilestoneAction } from './toggleMilestone';
import { toggleToothAction } from './toggleTooth';
import type { ActionContext } from './types';
import { updateChildAction } from './updateChild';
import { updateDiaryEntryAction } from './updateDiaryEntry';
import { upsertCareTaskRecordAction } from './upsertCareTaskRecord';
import { upsertPrenatalRecordAction } from './upsertPrenatalRecord';

export function createChildStoreActions(context: ActionContext) {
  return {
    toggleMilestone: toggleMilestoneAction(context),
    setVaccineDose: setVaccineDoseAction(context),
    addChild: addChildAction(context),
    joinChild: joinChildAction(context),
    updateChild: updateChildAction(context),
    deleteChild: deleteChildAction(context),
    deleteAccountData: deleteAccountDataAction(context),
    revokeOtherMembers: revokeOtherMembersAction(context),
    setJoinOpen: setJoinOpenAction(context),
    setCurrentChild: setCurrentChildAction(context),
    toggleDevelopmentCheck: toggleDevelopmentCheckAction(context),
    toggleTooth: toggleToothAction(context),
    upsertPrenatalRecord: upsertPrenatalRecordAction(context),
    clearPrenatalRecord: clearPrenatalRecordAction(context),
    recordBirth: recordBirthAction(context),
    upsertCareTaskRecord: upsertCareTaskRecordAction(context),
    clearCareTaskRecord: clearCareTaskRecordAction(context),
    addDiaryEntry: addDiaryEntryAction(context),
    updateDiaryEntry: updateDiaryEntryAction(context),
    deleteDiaryEntry: deleteDiaryEntryAction(context),
  };
}
