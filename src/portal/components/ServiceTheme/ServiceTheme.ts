import type { ServiceId } from '~app/portal/domain/serviceCatalogue';
export interface ServiceTheme {
  id: ServiceId;
  /** Wordmark, shown in the page header. */
  name: string;
  /** Two-to-four character Chinese role label sitting under the wordmark. */
  role: string;
  /** The one icon this service is allowed to use as identity. */

  /** Page background. */
  pageBg: string;
  /** Faint tint for a panel that needs to sit apart from a white sibling. */
  tint: string;
  /** Decorative fill: progress bars, dots, active indicators. Never text. */
  accent: string;
  /** Readable brand shade: headings, links, icon glyphs on white. */
  ink: string;
  /**
   * Solid bed for a primary button or active chip. Pair it with `fillText` —
   * a yellow brand cannot reach 4.5:1 under white text without going brown
   * and losing the colour entirely, so LittleExplorer keeps its bright amber
   * and puts dark ink on it (6.31:1) instead.
   */
  fill: string;
  /** Text colour that belongs on `fill`. */
  fillText: string;
  /** Body copy. */
  body: string;
  /** Muted captions. */
  muted: string;
}

export const SERVICE_THEME: Record<ServiceId, ServiceTheme> = {
  littlesteps: {
    id: 'littlesteps',
    name: 'LittleSteps',
    role: '寶寶成長',
    pageBg: 'bg-warm-white',
    tint: 'bg-primary-soft',
    accent: 'bg-primary',
    ink: 'text-primary-dark',
    fill: 'bg-primary-dark',
    fillText: 'text-white',
    body: 'text-ink',
    muted: 'text-ink-muted',
  },
  littlebloom: {
    id: 'littlebloom',
    name: 'LittleBloom',
    role: '孕期陪伴',
    pageBg: 'bg-bloom-cream',
    tint: 'bg-bloom-blush/50',
    accent: 'bg-bloom-dusty-rose',
    ink: 'text-bloom-dusty-rose-ink',
    fill: 'bg-bloom-dusty-rose-deep',
    fillText: 'text-white',
    body: 'text-bloom-stone-ink',
    // /80 keeps muted visibly lighter than body while still clearing the 3:1
    // floor on bloom-cream (3.38:1). /70 was 2.82:1 there — under the floor.
    muted: 'text-bloom-stone-ink/80',
  },
  littleexplorer: {
    id: 'littleexplorer',
    name: 'LittleExplorer',
    role: '幼兒期陪伴',
    pageBg: 'bg-explorer-sand',
    tint: 'bg-explorer-sunbeam-light/30',
    accent: 'bg-explorer-sunbeam',
    ink: 'text-explorer-sunbeam-ink',
    fill: 'bg-explorer-sunbeam',
    fillText: 'text-ink',
    body: 'text-explorer-bark',
    muted: 'text-explorer-bark/70',
  },
  babyoasis: {
    id: 'babyoasis',
    name: 'BabyOasis',
    role: '哺乳室地圖',
    pageBg: 'bg-warm-white',
    tint: 'bg-secondary-soft',
    accent: 'bg-secondary',
    ink: 'text-secondary-dark',
    fill: 'bg-secondary-dark',
    fillText: 'text-white',
    body: 'text-ink',
    muted: 'text-ink-muted',
  },
  littleouting: {
    id: 'littleouting',
    name: 'LittleOuting',
    role: '親子好去處',
    pageBg: 'bg-warm-white',
    tint: 'bg-outing-soft',
    accent: 'bg-outing',
    ink: 'text-outing-ink',
    fill: 'bg-outing-ink',
    fillText: 'text-white',
    body: 'text-ink',
    muted: 'text-ink-muted',
  },
  littleguard: {
    id: 'littleguard',
    name: 'LittleGuard',
    role: '疫情雷達',
    // Shield 而不是 ShieldAlert：後者的圖形裡有一個驚嘆號，而這個服務的第一條
    // 約束就是提醒而不是驚嚇。這個 repo 裡 ShieldAlert 也已經另有意思——
    // careGuides 的「環境安全」、toddlerWiki 的頭部外傷、疫苗頁的「接種注意事項」
    // 都用它，拿它當雷達的識別圖示會連到疫苗，那正是這個服務不碰的領域。
    // 也不用 ShieldCheck：打勾等於宣告「安全」，雷達沒有資格說那句話。
    pageBg: 'bg-warm-white',
    tint: 'bg-guard-soft',
    accent: 'bg-guard',
    ink: 'text-guard-ink',
    fill: 'bg-guard-ink',
    fillText: 'text-white',
    body: 'text-ink',
    muted: 'text-ink-muted',
  },
};
