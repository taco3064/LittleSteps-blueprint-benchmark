import type { ChildExportSource } from '../childExport';
import type { GestationalAge } from '../correctedAge';
import type {
  CareTaskRecord,
  ChildProfile,
  DevelopmentCheckProgress,
  DiaryEntry,
  Gender,
  MilestoneProgress,
  PrenatalCheckupProgress,
  ToothProgress,
  VaccineProgress,
} from '../records';
export interface ChildStore {
  childProfiles: ChildProfile[];
  currentChildId: string | null;
  currentChild: ChildProfile | undefined;
  currentChildMilestoneProgress: MilestoneProgress;
  currentChildVaccineProgress: VaccineProgress;
  currentChildDevelopmentProgress: DevelopmentCheckProgress;
  currentChildToothProgress: ToothProgress;
  childrenLoading: boolean;
  toggleMilestone: (id: string) => Promise<void>;
  setVaccineDose: (input: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    date?: string;
  }) => Promise<void>;
  addChild: (input: {
    name: string;
    birthday: string;
    gender?: Gender;
    dueDate?: string;
    gestationalAge?: GestationalAge;
  }) => Promise<void>;
  joinChild: (childUuid: string) => Promise<void>;
  updateChild: (input: {
    id: string;
    name: string;
    birthday: string;
    gender?: Gender;
    gestationalAge?: GestationalAge;
  }) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  /**
   * 一次讀完整份紀錄，給匯出用。回傳資料而不是直接下載：組檔與觸發下載是
   * 瀏覽器那一側的事，留在呼叫端做，資料層只負責讀。
   *
   * 失敗往上丟。帳號視窗接住之後出訊息——在這裡吞掉的話，家長按了匯出，
   * 畫面上什麼都不會發生。
   */
  readChildExport: (childId: string) => Promise<ChildExportSource>;
  /**
   * 刪除帳號的資料端：所有孩子、我的成員資格，以及自己的 users/{uid}。Auth
   * 使用者本身由 AuthContext 的 deleteAccount 接手，順序不能反。失敗往上丟：
   * 呼叫端必須知道資料還在，否則會接著把 Auth 使用者也刪掉，留下一份沒有人
   * 碰得到的資料。
   */
  deleteAccountData: () => Promise<void>;
  /**
   * 收回分享：把其他成員移出這個孩子的名單，並關掉加入。分享視窗自己出訊息，
   * 所以這兩個跟表單那一組一樣往上丟。
   */
  revokeOtherMembers: (childId: string) => Promise<void>;
  setJoinOpen: (childId: string, open: boolean) => Promise<void>;
  setCurrentChild: (id: string) => Promise<void>;
  toggleDevelopmentCheck: (checkItemId: string) => Promise<void>;
  toggleTooth: (toothId: string) => Promise<void>;
  /**
   * LittleBloom 這一頁是關於哪一份檔案。與「現在選了誰」無關——見
   * resolvePregnancyChild。
   */
  pregnancyChild: ChildProfile | undefined;
  pregnancyPrenatalProgress: PrenatalCheckupProgress;
  upsertPrenatalRecord: (
    templateId: string,
    record: { completedDate: string; clinicName?: string; notes?: string },
  ) => Promise<void>;
  clearPrenatalRecord: (templateId: string) => Promise<void>;
  recordBirth: (birthday: string, gender?: Gender) => Promise<void>;
  upsertCareTaskRecord: (record: CareTaskRecord) => Promise<void>;
  clearCareTaskRecord: (taskId: string) => Promise<void>;
  addDiaryEntry: (
    entry: Omit<DiaryEntry, 'id' | 'childId' | 'createdAt'>,
  ) => Promise<string | undefined>;
  updateDiaryEntry: (entryId: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteDiaryEntry: (entryId: string) => Promise<void>;
}
