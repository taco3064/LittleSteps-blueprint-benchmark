import { FeedingPrinciple } from '~app/knowledge/domain/referenceModels';

// 副食品添加基本原則
export const feedingPrinciples: FeedingPrinciple[] = [
  {
    title: '單一食材原則',
    description:
      '每次只能加一種新食材，至少試3~5天（72小時觀察期），若無過敏反應即可再試下一種',
  },
  {
    title: '奶為主食原則',
    description:
      '一歲前還是以奶為主食，10個月前盡量多喝奶，不要因為副食品而提早斷奶',
  },
  {
    title: '低敏優先原則',
    description:
      '只要是低敏食材一歲前都能試；高敏食材則依寶寶體質斟酌添加（高低敏僅為統計值，因人而異）',
  },
  {
    title: '添加植物油',
    description:
      '開始加菜後，可於副食品中滴入1~3滴植物油（如橄欖油、亞麻仁油等）幫助腸胃蠕動、預防便祕',
  },
];
