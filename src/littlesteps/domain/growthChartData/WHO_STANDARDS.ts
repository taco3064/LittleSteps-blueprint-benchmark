import { femaleHeadCircumferenceStandards } from './femaleHeadCircumferenceStandards';
import { femaleHeightStandards } from './femaleHeightStandards';
import { femaleWeightStandards } from './femaleWeightStandards';
import { maleHeadCircumferenceStandards } from './maleHeadCircumferenceStandards';
import { maleHeightStandards } from './maleHeightStandards';
import { maleWeightStandards } from './maleWeightStandards';

export const WHO_STANDARDS = {
  male: {
    weight: maleWeightStandards,
    height: maleHeightStandards,
    headCircumference: maleHeadCircumferenceStandards,
  },
  female: {
    weight: femaleWeightStandards,
    height: femaleHeightStandards,
    headCircumference: femaleHeadCircumferenceStandards,
  },
};
