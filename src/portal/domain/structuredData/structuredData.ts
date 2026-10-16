import { SITE_ORIGIN } from '../pageMeta';

/**
 * JSON-LD 結構化資料。
 *
 * 為什麼百科拿 Article 標記，其他頁面不拿
 *   這個 app 真正有差異的內容是三個百科：每一篇的成因、做法與警訊都逐條對照
 *   衛福部、國健署與各醫院的衛教資料寫成，檔案上方標了內容查證日期，來源網址
 *   標在每一篇物件上方（見 littlebloom/data/wiki.ts、littleexplorer/data/
 *   toddlerWiki.ts）。也就是說它們是可查核、有時效的育兒衛教文章，Article 的
 *   dateModified 對家長是有意義的資訊——這一篇是哪一天對過來源的。
 *
 *   反過來，會讀某個孩子資料的頁面一律不做結構化資料，也不進 sitemap：那些頁面
 *   對未登入的爬蟲只是空殼，標記等於在描述一份不存在的內容。公開範圍的判準在
 *   src/common/routePolicy.ts。
 *
 * 這裡只回傳純物件，不回傳字串也不回傳 React 元件。序列化與插入 <script> 是
 * 呈現層的事；保持純物件，測試才能直接斷言欄位，而不是比對字串。
 */

/** JSON-LD 節點裡允許出現的值。不用 any，序列化前就能讓型別擋下錯誤的形狀。 */
export type JsonLdValue
  = string | number | boolean | JsonLdValue[] | { [key: string]: JsonLdValue };

export interface JsonLd {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: JsonLdValue;
}

const SITE_NAME = 'LittleSteps';
const LANGUAGE = 'zh-TW';
const LOGO_URL = `${SITE_ORIGIN}/pwa-512x512.png`;
const SHARE_IMAGE_URL = `${SITE_ORIGIN}/og-image.png`;

/** 允許呼叫端傳路由路徑（`/littlesteps/baby-wiki`）或完整網址。 */
function absoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${SITE_ORIGIN}${pathOrUrl}`;
}

/**
 * 每次都回傳新物件而不是共用一個常數：呼叫端拿到的東西常常會被再加工，共用
 * 節點會讓一頁的修改滲到另一頁。
 */
function publisher(): { [key: string]: JsonLdValue } {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
  };
}

/** 全站共用的 WebSite／Organization 標記，放在每一個公開頁面。 */
export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    inLanguage: LANGUAGE,
    description: '從懷孕、新生兒到 1-3 歲幼兒，六個服務陪台灣爸媽走過每個階段',
    publisher: publisher(),
  };
}

export interface ArticleJsonLdInput {
  /** 文章標題，與頁面上看到的 h1 一致。 */
  headline: string;
  description: string;
  /** 路由路徑或完整網址。 */
  url: string;
  /** 內容查證日期，YYYY-MM-DD。這是家長判斷衛教內容還新不新的依據。 */
  dateModified: string;
}

/** 一篇百科文章。datePublished 刻意不填：沒有這筆資料，不編。 */
export function articleJsonLd({
  headline,
  description,
  url,
  dateModified,
}: ArticleJsonLdInput): JsonLd {
  const canonical = absoluteUrl(url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    inLanguage: LANGUAGE,
    dateModified,
    image: SHARE_IMAGE_URL,
    isAccessibleForFree: true,
    author: publisher(),
    publisher: publisher(),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * 常見問題。呼叫端在 items 為空時不要輸出這段——沒有 Question 的 FAQPage
 * 是無效標記，而不是「一個空的 FAQ」。
 */
export function faqJsonLd(items: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: LANGUAGE,
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export interface BreadcrumbStep {
  name: string;
  /** 路由路徑或完整網址。 */
  url: string;
}

/** 麵包屑。position 從 1 開始，順序就是 trail 的順序。 */
export function breadcrumbJsonLd(trail: BreadcrumbStep[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(url),
    })),
  };
}
