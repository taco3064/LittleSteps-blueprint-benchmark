// 4x3 試敏法
export const allergyTestingMethod = {
  name: '4x3 試敏法',
  description: '早期接觸（4-9個月內）反而能建立免疫耐受性，降低未來過敏機率',
  steps: [
    {
      step: 1,
      title: '小量試3天',
      description: '第一天給一小口，觀察是否有紅疹、腹瀉、嘔吐',
    },
    {
      step: 2,
      title: '增量試3天',
      description: '若無反應，第二天增加份量，持續觀察',
    },
    {
      step: 3,
      title: '觀察3天',
      description: '停止新食材，觀察是否有延遲性過敏',
    },
  ],
  principle: '每次只試「一種」新食材，若發生過敏，記錄並暫停該食材1-2個月再試',
};
