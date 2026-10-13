import type { Page } from '../routes';

const captions: Partial<Record<Page, string>> = {
  'littlesteps/dashboard': '成長總覽',
  'littlesteps/milestones': '里程碑追蹤',
  'littlesteps/care-guide': '照顧重點',
  'littlesteps/vaccine-tracking': '疫苗追蹤',
  'littlesteps/complementary-food': '副食品指南',
  'littlesteps/daily-log': '快速日誌',
  'littlesteps/growth-charts': '成長曲線圖',
  'littlesteps/sleep-training': '睡眠訓練',
  'littlesteps/sleep-analysis': '睡眠分析',
  'littlesteps/baby-wiki': '寶寶百科',
  'littlesteps/clinic-summary': '看診摘要',
  'littlesteps/report': '週報月報',
};

export function pageTitle(page: Page, childName?: string) {
  if (page === 'littlebloom') {
    return 'LittleBloom';
  }

  if (page.startsWith('littleexplorer')) {
    return 'LittleExplorer';
  }

  const title
    = childName && page !== 'littlesteps' ? `${childName} 的 ` : 'LittleSteps';

  return title + (captions[page] ?? '');
}
