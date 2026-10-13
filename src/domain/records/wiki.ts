// Wiki Types (shared presentational model; each sub-app owns its own category set)
export interface WikiCategoryColors {
  bg: string;
  text: string;
  pill: string;
}

export interface WikiArticle<Category extends string = string> {
  id: string;
  title: string;
  summary: string;
  category: Category;
  causes: string[];
  solutions: { step: string; detail: string }[];
  warningSignals: string[];
  relatedArticleIds: string[];
  icon: string;
}

// Baby Wiki (寶寶百科) — LittleSteps
export type WikiCategory
  = 'skin' | 'oral' | 'motor' | 'digestive' | 'fever' | 'sleep' | 'daily';

export type BabyWikiArticle = WikiArticle<WikiCategory>;

// Pregnancy Wiki (孕期知識庫) — LittleBloom
export type PregnancyWikiCategory
  = 'nutrition' | 'health' | 'symptoms' | 'checkup' | 'lifestyle';

export type PregnancyWikiArticle = WikiArticle<PregnancyWikiCategory>;
