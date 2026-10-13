import {
  entryDroolRash,
  entryDiaperRash,
  entryAtopicDermatitis,
  entryRoseola,
} from './skinArticles';
import { entryTeething } from './oralArticles';
import {
  entryNursingStrike,
  entryColic,
  entryConstipation,
} from './digestiveArticles';
import {
  entryNasalCongestion,
  entryFeverAssessment,
  entryEnterovirus,
} from './feverArticles';
import {
  entryRollingSafety,
  entryCrawlingSafety,
  entryWalkingSafety,
} from './motorArticles';
import { entrySidsPrevention } from './sleepArticles';
import { BabyWikiArticle, WikiCategory, WikiCategoryColors } from '../records';

export const wikiCategoryLabels: Record<WikiCategory, string> = {
  skin: '皮膚問題',
  oral: '口腔與長牙',
  motor: '動作發展',
  digestive: '腸胃與排便',
  fever: '發燒與感冒',
  sleep: '睡眠問題',
  daily: '日常照顧',
};

export const babyWikiCategoryColors: Record<WikiCategory, WikiCategoryColors> = {
  skin: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    pill: 'bg-pink-100 text-pink-700',
  },
  oral: { bg: 'bg-sky-50', text: 'text-sky-700', pill: 'bg-sky-100 text-sky-700' },
  motor: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    pill: 'bg-emerald-100 text-emerald-700',
  },
  digestive: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    pill: 'bg-amber-100 text-amber-700',
  },
  fever: { bg: 'bg-red-50', text: 'text-red-700', pill: 'bg-red-100 text-red-700' },
  sleep: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    pill: 'bg-indigo-100 text-indigo-700',
  },
  daily: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    pill: 'bg-teal-100 text-teal-700',
  },
};

export const babyWikiArticles: BabyWikiArticle[] = [
  entryDroolRash,
  entryDiaperRash,
  entryAtopicDermatitis,
  entryRoseola,
  entryTeething,
  entryNursingStrike,
  entryColic,
  entryConstipation,
  entryNasalCongestion,
  entryFeverAssessment,
  entryEnterovirus,
  entryRollingSafety,
  entryCrawlingSafety,
  entryWalkingSafety,
  entrySidsPrevention,
];
