import { useEffect } from 'react';
import { metaFor } from '~app/portal/domain/pageMeta';
import type { Page } from '~app/portal/domain/routes';

/**
 * 把 <head> 的內容換成目前這一頁的。
 *
 * SPA 只有一份 index.html，換頁不會換標題。結果是分享任何一頁到 LINE，
 * 預覽都寫「LittleSteps - 孕期到幼兒的育兒陪伴」，瀏覽器分頁與書籤也全部同名。
 *
 * 用直接操作 DOM 而不是引入 helmet 之類的套件：要做的事就是設幾個屬性，
 * 為此多背一個相依套件不划算。
 */
function upsertMeta(
  selector: string,
  create: () => HTMLMetaElement | HTMLLinkElement,
) {
  let el = document.head.querySelector(selector);

  if (!el) {
    el = create();
    document.head.appendChild(el);
  }

  return el;
}

function setMetaContent(
  attr: 'name' | 'property',
  key: string,
  content: string,
) {
  const el = upsertMeta(`meta[${attr}="${key}"]`, () => {
    const meta = document.createElement('meta');

    meta.setAttribute(attr, key);

    return meta;
  });

  el.setAttribute('content', content);
}

export function useDocumentMeta(page: Page): void {
  useEffect(() => {
    const meta = metaFor(page);

    document.title = meta.title;
    setMetaContent('name', 'description', meta.description);

    // og:url 與 canonical 指向同一個網址，否則社群分享與搜尋引擎會各自
    // 認一個版本，權重被拆成兩份。
    setMetaContent('property', 'og:title', meta.title);
    setMetaContent('property', 'og:description', meta.description);
    setMetaContent('property', 'og:url', meta.canonical);
    setMetaContent('property', 'twitter:title', meta.title);
    setMetaContent('property', 'twitter:description', meta.description);
    setMetaContent('property', 'twitter:url', meta.canonical);

    // 需登入的頁面讀的是某一個家庭的健康資料。就算爬蟲看到的是登入前的
    // 空殼，也不該讓這些網址進搜尋結果。
    setMetaContent(
      'name',
      'robots',
      meta.noindex ? 'noindex, follow' : 'index, follow',
    );

    const canonical = upsertMeta('link[rel="canonical"]', () => {
      const link = document.createElement('link');

      link.setAttribute('rel', 'canonical');

      return link;
    });

    canonical.setAttribute('href', meta.canonical);
  }, [page]);
}
