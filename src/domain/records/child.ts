import type { Gender } from './growth';
import type { MilestoneProgress } from './milestones';
import type { FoodTrackingProgress } from './foodTrials';
import type { DevelopmentCheckProgress } from './development';
import type { CareTaskProgress } from './care';
import type { ToothProgress } from './teeth';
import type { PregnancyData, PrenatalCheckupProgress } from './pregnancy';

export interface VaccineProgress {
  [vaccineId: string]: {
    doses: {
      [doseNumber: number]: {
        administered: boolean;
        administeredDate?: string; // YYYY-MM-DD
      };
    };
  };
}

export interface ChildProfile {
  id: string; // Unique UUID for sharing across family members
  name: string;
  birthday: string; // YYYY-MM-DD
  gender?: Gender; // Optional: for growth chart percentiles
  /**
   * 出生時的妊娠週數與天數，例如 32 週 3 天。只有早產兒需要填。
   *
   * 有了它，生長曲線、里程碑與發展檢核才算得出矯正年齡（見
   * common/correctedAge）。沒填一律當足月處理，行為與這個欄位存在之前完全
   * 相同。公費疫苗與兒童健檢刻意不受它影響——那些時程照實際出生日期算。
   */
  gestationalAgeWeeks?: number;
  gestationalAgeDays?: number;
  milestoneProgress: MilestoneProgress;
  vaccineProgress: VaccineProgress;
  foodTrackingProgress?: FoodTrackingProgress; // Optional: complementary food tracking
  // LittleExplorer (幼兒期 1-3 歲) fields
  developmentProgress?: DevelopmentCheckProgress;
  careTaskProgress?: CareTaskProgress;
  toothProgress?: ToothProgress;
  // Pregnancy specific fields
  isPregnancy?: boolean;
  pregnancyData?: PregnancyData;
  prenatalProgress?: PrenatalCheckupProgress;
  createdAt: string; // ISO string
  createdBy: string; // User ID who created this child profile
  /**
   * 誰讀得到、寫得了這份健康紀錄——授權就存在這裡。
   *
   * users/{uid}/childrenIds 只剩「我要訂閱哪幾個孩子」的索引；那份節點只有
   * 本人寫得動，所以代碼一旦傳出去就永遠收不回來，唯一的補救是把紀錄整份
   * 刪掉、連另一位家長的一起。成員名單搬進孩子本體之後，任何一位成員都能把
   * 另一位移掉，分享才真的是可撤回的。
   */
  members: Record<string, true>;
  /** 拿到代碼的人能不能把自己加進 members。關掉之後，流出去的舊代碼就加入不了。 */
  joinOpen?: boolean;
}
