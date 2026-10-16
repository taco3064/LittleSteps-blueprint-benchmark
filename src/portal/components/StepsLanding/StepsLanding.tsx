import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MAX_CHILDREN } from '~app/family/domain/childLimits';
import {
  fadeInUp,
  listItem,
  stagger,
  tap,
} from '~app/platform/components/Motion';
import type { Page } from '~app/portal/domain/routes';
import AppHomeButton from '../AppHomeButton';

/** 這一頁能導去的地方，全都在 routePolicy 的公開允許清單裡。 */
type PublicContent
  = | 'littlesteps/baby-wiki'
    | 'littlesteps/care-guide'
    | 'littlesteps/sleep-training';

interface StepsLandingProps {
  /** 只能指向 LittleSteps 免登入的內容；功能頁要先登入，導過去只會退回這一頁。 */
  onNavigate: (page: Page) => void;
  onSignIn: () => Promise<void>;
}

/**
 * 登入後做得到的事，一行一個。
 *
 * 這裡原本是三格「為什麼選擇 LittleSteps？」加五格功能卡，兩份講同一批功能，
 * 中間還夾著一段行銷文案；整頁要滑到 1,300px 才出現第一個功能。寫法改成跟
 * LittleBloom、LittleExplorer 的介紹頁一樣：一句這是什麼，接著一條一條說做得到
 * 什麼，最後只留一個入口。
 *
 * 匯出是為了讓測試逐項走過，而不是手抄一份標題清單（同 HubLanding 的
 * SERVICE_GROUPS）：抄的那份會跟著這一份一起被改，於是漏掉一項不會變紅。
 */
export const FEATURES = [
  {
    title: '里程碑與生長曲線',
    detail:
      '記下會翻身、會坐、會叫爸媽的那一天；身高體重自動對照 WHO 生長標準。',
  },
  {
    title: '疫苗與兒童健檢',
    detail:
      '公費項目依出生日期排好時程，打過的勾起來，下一針什麼時候一眼看得到。',
  },
  {
    title: '每日記錄與睡眠分析',
    detail: '餵奶、睡眠、尿布隨手記一筆，自動整理成一天的作息。',
  },
  { title: '副食品追蹤', detail: '一樣一樣試，過敏反應一筆一筆記。' },
  {
    title: '看診摘要',
    detail: '看診前把成長、疫苗與最近的記錄整理成一頁，不用憑印象回答醫師。',
  },
];

/**
 * 不用帳號就讀得到的內容。
 *
 * 入口頁只說「知識內容不需登入」，這一頁說得出是哪幾份、按哪裡進去——這是它
 * 比入口頁多給的東西，睡眠指南的入口也只有這裡有。
 *
 * 該列哪幾頁不由這裡決定：判準是 routePolicy 裡不需登入的 LittleSteps 內容頁，
 * 測試就是拿那份清單來比對的。
 */
export const PUBLIC_CONTENT: {
  title: string;
  detail: string;
  page: PublicContent;
}[] = [
  {
    title: '照顧重點',
    detail: '各階段專業照護建議',
    page: 'littlesteps/care-guide',
  },
  {
    title: '寶寶百科',
    detail: '常見照顧問題與處理方式',
    page: 'littlesteps/baby-wiki',
  },
  {
    title: '睡眠指南',
    detail: '0-3 歲科學睡眠指南，整理自衛生福利部與各界育兒專家',
    page: 'littlesteps/sleep-training',
  },
];

/**
 * LittleSteps 未登入時的介紹頁。登入後要去哪由 LandingPage 統一決定——
 * 這裡原本也有一份 useEffect 會在登入瞬間跳去儀表板，但它不看使用者有沒有
 * 孩子，剛註冊的人會落在空的儀表板上。
 *
 * 這一頁拿不到已登入的 user，所以登入按鈕不需要條件：landingKindFor 只在
 * `!user` 的兩個分支回傳 steps-intro，而 App 在同一次 render 裡用同一個
 * user 算出 kind 並傳下來。原本那個 `{!user && ...}` 讀起來像這一頁有登入
 * 後的樣子，但那個樣子不存在，也沒有辦法看到。
 */
export default function StepsLanding({
  onNavigate,
  onSignIn,
}: StepsLandingProps) {
  return (
    <div className="min-h-dscreen bg-warm-white">
      {/*
        這一頁自己給 <main>，但刻意不給 <header>。

        它在 App.tsx 的 isStandaloneLanding 那裡就先回傳了，外框的 <main> 根本
        走不到——而這是每個未登入的訪客在需登入路由上看到的第一頁，少了這一層
        就整頁沒有任何地標可以跳。

        沒有 banner 是因為這一頁的 chrome 只有一顆回服務集合首頁的連結，
        wordmark 與說明本身就是內容；把那顆連結包成 <header>，等於多一個什麼
        都沒指名的地標，比沒有更難用。
      */}
      <main className="screen-body space-y-4">
        {/*
          沒登入時，任何需要登入的 LittleSteps 路由都會落到這一頁——登出後、
          從書籤進入、瀏覽器還原分頁都算。少了這顆按鈕，這裡就是死路：頁面
          完全沒提到另外五個服務，也沒有回服務集合首頁的路，只能手動改網址。
        */}
        <div className="flex justify-end">
          <AppHomeButton onHome={() => onNavigate('home')} />
        </div>

        <StepsLandingView0Part1 onSignIn={onSignIn} />

        <StepsLandingView0Part2 onNavigate={onNavigate} />
      </main>
    </div>
  );
}

function StepsLandingView0Part1({
  onSignIn,
}: {
  onSignIn: () => Promise<void>;
}) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="panel"
    >
      <h1 className="sm:text-3xl text-primary-dark">LittleSteps</h1>
      <p className="text-sm text-ink-muted mb-4">寶寶成長</p>
      <p className="text-ink leading-relaxed mb-6">
        0 到 1
        歲的成長紀錄：里程碑、生長曲線、公費疫苗，還有每天的餵奶與睡眠，都收在同一份檔案裡。
      </p>

      <h2 className="text-ink mb-3">登入後開始記錄</h2>
      <motion.ul
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {FEATURES.map((feature) => (
          <motion.li key={feature.title} variants={listItem}>
            <p className="font-semibold text-ink">{feature.title}</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              {feature.detail}
            </p>
          </motion.li>
        ))}
      </motion.ul>

      {/*
            家長讀第二遍的就是這一段，所以它要對得起 database.rules.json：授權
            掛在 children/$childId/members，不是掛在某一個人身上。這裡原本寫
            「僅限本人存取」，跟資料庫規則正好相反——而真相（另一半跟你拿著同
            一份紀錄，誰都能把對方收回）比那句話更值得講。
          */}
      <h2 className="text-ink mt-8 mb-2">這份紀錄屬於你們家</h2>
      {/* 整段寫成一行：JSX 會把換行縮排收成一個空白，中文句號後面跟著空白很刺眼。 */}
      <p className="text-sm text-ink-muted leading-relaxed">
        {'寶寶的紀錄放在一份全家共用的檔案裡：用分享代碼把另一半或家人加進來，加完就能把代碼關掉，之後也隨時可以把成員移'
          + '除。成員之間沒有權限高低——每一位成員都看得到、也改得動全部內容，並且可以移除其他成員；唯一的限制是名單不能空'
          + '掉，最後一位成員無法把自己移除。會用到寶寶資料的頁面都必須登入；知識內容不用帳號也讀得到。'}
      </p>
      <p className="text-sm text-ink-faint mt-3">
        目前免費使用，一個帳號最多追蹤
        {' '}
        {MAX_CHILDREN}
        {' '}
        個寶寶。
      </p>

      <motion.button
        type="button"
        whileTap={tap}
        onClick={onSignIn}
        className="btn-primary w-full mt-6"
      >
        {/* 這裡原本掛一張 gstatic.com 的 Google 圖示。離線或被擋下時，
                已安裝的 PWA 的第一個畫面就會出現破圖——為了一個裝飾去依賴
                外部網域不值得，其他三處登入按鈕也都只有文字。 */}
        使用 Google 登入開始記錄
      </motion.button>
    </motion.section>
  );
}

function StepsLandingView0Part2({
  onNavigate,
}: {
  onNavigate: (page: Page) => void;
}) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      <h2 className="text-ink">直接閱讀，不用登入</h2>
      <ul className="space-y-2">
        {PUBLIC_CONTENT.map((item) => (
          <li key={item.page}>
            {/* 內容用 span 不用 h3：按鈕裡不能放標題或其他互動元素（見 ui/pressable）。 */}
            <motion.button
              type="button"
              whileTap={tap}
              onClick={() => onNavigate(item.page)}
              className="card-tap w-full flex items-center gap-3 text-left"
            >
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-ink">
                  {item.title}
                </span>
                <span className="block text-sm text-ink-muted leading-snug mt-0.5">
                  {item.detail}
                </span>
              </span>
              <ArrowRight
                className="w-4 h-4 shrink-0 text-primary-dark"
                aria-hidden="true"
              />
            </motion.button>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
