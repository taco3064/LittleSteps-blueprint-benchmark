import type { Page } from '../routes';

const titles: Partial<Record<Page, string>> = {
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

export function pageTitle(page: Page, child: { name: string } | undefined) {
  if (page === 'littlebloom') {
    return 'LittleBloom';
  }

  if (page.startsWith('littleexplorer')) {
    return 'LittleExplorer';
  }

  const prefix
    = child && page !== 'littlesteps' ? `${child.name} 的 ` : 'LittleSteps';

  return prefix + (titles[page] ?? '');
}
