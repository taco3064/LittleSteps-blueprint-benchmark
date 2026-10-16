import {
  INDEXABLE_PAGES,
  SITE_ORIGIN,
  metaFor,
} from '../pageMeta';
import { ROUTE_PATH, type Page } from '../routes';
import { organizationJsonLd } from '../structuredData';

/**
 * 建置期用的 <head> 產生器。
 *
 * SPA 只有一份 index.html，所有網址拿到的 title 與 description 都一樣。
 * 爬蟲要先跑完 690 KB 的 bundle 才看得到正確的 meta——Googlebot 做得到，
 * 但慢且不保證；社群平台的爬蟲則根本不執行 JS，所以分享任何一頁到 LINE
 * 或 Facebook，預覽都會是首頁的文案。
 *
 * 這裡在建置後為每個公開路由寫出一份 index.html 副本，把 head 換成那一頁
 * 的內容。不做 React SSR：真正卡住索引的是 metadata，而 SSR 一個吃
 * Leaflet 與 Firebase 的 app 要付的代價遠高於它換到的東西。
 */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** 這些標籤在 index.html 是首頁的版本，每一頁都要換掉。 */
const REPLACEABLE = [
  /<title>[\s\S]*?<\/title>\s*/g,
  /<meta\s+name="description"[^>]*>\s*/g,
  /<meta\s+property="og:title"[^>]*>\s*/g,
  /<meta\s+property="og:description"[^>]*>\s*/g,
  /<meta\s+property="og:url"[^>]*>\s*/g,
  /<meta\s+property="twitter:title"[^>]*>\s*/g,
  /<meta\s+property="twitter:description"[^>]*>\s*/g,
  /<meta\s+property="twitter:url"[^>]*>\s*/g,
];

export function headFor(page: Page): string {
  const meta = metaFor(page);
  const jsonLd = JSON.stringify(organizationJsonLd());

  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta name="robots" content="${meta.noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="twitter:url" content="${meta.canonical}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ');
}

/** 把 index.html 的 head 換成指定頁面的版本。 */
export function renderPageHtml(template: string, page: Page): string {
  let html = template;

  for (const pattern of REPLACEABLE) {
    html = html.replace(pattern, '');
  }

  return html.replace('</head>', `  ${headFor(page)}\n  </head>`);
}

/** 建置後要額外寫出的頁面：公開的才寫，需登入的沒有被索引的理由。 */
export function pagesToPrerender(): { page: Page; outDir: string }[] {
  return INDEXABLE_PAGES.filter((page) => page !== 'home').map((page) => ({
    page,
    outDir: ROUTE_PATH[page].replace(/^\//, ''),
  }));
}

export function renderSitemap(lastmod: string): string {
  const entries = INDEXABLE_PAGES.map((page) => {
    // 三個百科與服務集合首頁會隨內容增修而變；照顧重點與睡眠指南是穩定的
    // 參考資料，宣告成每週更新只會讓爬蟲白跑。
    const isWiki = page.includes('wiki') || page === 'home';

    return [
      '  <url>',
      `    <loc>${SITE_ORIGIN}${ROUTE_PATH[page]}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${isWiki ? 'weekly' : 'monthly'}</changefreq>`,
      `    <priority>${page === 'home' ? '1.0' : isWiki ? '0.8' : '0.6'}</priority>`,
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * robots.txt 也從同一張表產生。
 *
 * 手寫的話它是一份 routePolicy 白名單的副本，而且是 fail-open 的：新增一個
 * 需登入的頁面卻忘了補 Disallow，那一頁就會被爬。從 ROUTE_PATH 推導之後，
 * 漏掉在結構上不可能發生。
 */
export function renderRobotsTxt(): string {
  const gated = (Object.keys(ROUTE_PATH) as Page[])
    .filter((page) => metaFor(page).noindex)
    .map((page) => ROUTE_PATH[page]);

  const publicPaths = INDEXABLE_PAGES.map((page) => ROUTE_PATH[page]);

  return [
    '# 由 src/common/seo/staticHead.ts 於建置時產生，不要手改。',
    '#',
    '# 判準與 src/common/routePolicy.ts 的公開白名單同一份：需要某個孩子的',
    '# 資料才有意義的頁面一律不進索引。它們渲染的是某一個家庭的健康紀錄，',
    '# 未登入的爬蟲只會拿到空殼，還會讓「LittleSteps 睡眠」這類查詢落到',
    '# 登入牆而不是真正的內容上。',
    '#',
    '# 服務首頁後面的 $ 是「網址結束於此」：沒有它，/littlesteps 這一條會以',
    '# 前綴的方式連底下公開的百科一起擋掉。',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    ...gated.map((path) => {
      // 只有在還有更深的公開路由掛在同一個前綴底下時才需要錨定。
      const needsAnchor = publicPaths.some((open) =>
        open.startsWith(`${path}/`),
      );

      return `Disallow: ${path}${needsAnchor ? '$' : ''}`;
    }),
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
}
