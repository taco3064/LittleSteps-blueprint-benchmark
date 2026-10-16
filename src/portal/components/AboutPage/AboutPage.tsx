import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import AppBar from '~app/platform/components/AppBar';
import {
  collapse,
  fadeInUp,
  listItem,
  stagger,
} from '~app/platform/components/Motion';
import {
  ABOUT_LAST_UPDATED,
  COVERAGE,
  DATA_SOURCES,
  DEVICE_STORE_DESCRIBED,
  HONEST_GAPS,
} from '~app/portal/domain/dataSources';
import { SERVICE_THEME } from '../ServiceTheme';

/**
 * The one page that says, in a parent's words, where a child's records live,
 * who can read them, and where every number in the app comes from.
 *
 * Public on purpose: it is written for the visitor who has not decided whether
 * to hand over an account, so gating it would contradict itself. It renders
 * its own AppBar under the app's own brand rather than any service's, because
 * it describes all six.
 *
 * Structure follows the order a worried parent asks, not the order the system
 * is built in. Warmth comes from copy, spacing and one tint; the page carries a
 * single icon, on the links that leave the app, because that is the one place
 * the words do not already say it.
 *
 * Every claim that could rot — a count, a source, what the device store holds —
 * is data in `dataSources.ts`, held against the real thing by its test. The
 * prose here is deliberately the part that cannot be wrong on its own.
 */

const theme = SERVICE_THEME.littlesteps;

const NUMBER = new Intl.NumberFormat('zh-TW');

function Section({
  title,
  tinted = false,
  children,
}: {
  title: string;
  tinted?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className={`panel space-y-3 ${tinted ? theme.tint : ''}`}
    >
      <h2 className={theme.ink}>{title}</h2>
      {children}
    </motion.section>
  );
}

/** Body copy, one paragraph per sentence group. */
function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-muted leading-relaxed">{children}</p>;
}

/** A plain list; the words carry its meaning. */
function Plain({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="text-sm text-ink-muted leading-relaxed pl-4 -indent-4"
        >
          ・
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage({
  onHome,
  signedIn,
}: {
  onHome: () => void;
  signedIn: boolean;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();

  // The store keeps eight keys that a parent would describe in five phrases:
  // three of them are "the county I looked at last" for three services.
  const storedOnDevice = [...new Set(Object.values(DEVICE_STORE_DESCRIBED))];

  return (
    <div className="screen">
      <AppBar
        theme={theme}
        title="關於資料"
        onBack={onHome}
        backLabel="返回所有服務"
      />

      {/* 自帶 chrome 的頁面要自己給 <main>：App.tsx 的外框對這一份名單上的頁面
          不再包一層（見那裡的註解），因為包住 AppBar 會讓它不再是 banner 地標。
          少了這一行，這一頁就一個地標都沒有。A11Y-02 會抓。 */}
      <main className="screen-body space-y-6">
        <AboutIntro />

        <PrivacySections storedOnDevice={storedOnDevice} />

        <AboutPageView0Part1 />

        {/* 標題的順序就是段落的順序：先「帶得走」，再「刪得掉」。四段各講一件
            事，而摘要那一句要緊跟在整份匯出後面——它是同一個問題的次要答案，
            擺在前面會讓家長以為那三種摘要就是全部。 */}
        <Section title="隨時帶得走，也刪得掉">
          <P>
            整份紀錄可以一鍵匯出成檔案：在帳號視窗按下寶寶旁邊的匯出，檔案、所有日誌、成長紀錄與日記會一起存成一個檔案，那份是你的。
          </P>
          <P>
            看診摘要、週報與行事曆匯出是給特定場合的摘要版本，隨時也帶得走。
          </P>
          <P>
            刪掉一個孩子是一次刪完：檔案、所有日誌、成長紀錄與日記一起消失，不會留下半截。
          </P>
          <P>
            帳號本身也刪得掉，入口在同一個視窗：只有你一個人在用的孩子會整份消失，還有家人在用的則是把你從名單上移除、紀錄留給他們，最後連你的登入帳號一起消失。
          </P>
        </Section>

        <AboutPageView0Part2 />

        <Section title="查不到的時候，我們就寫查不到">
          <Plain
            items={[
              `${HONEST_GAPS.unverifiedCentreCounties} 個縣市的親子館入館規則沒有官方公告，我們就標「未查證」，不會把別的縣市的規則套過去。`,
              '樣本太小的縣市與年齡層，我們寫「資料太少」，不會給它一個看起來很確定的狀態。',
              '每一篇衛教文章都標了查證日期。',
              `親子餐廳只收錄 ${HONEST_GAPS.restaurantSample} 間，而且我們寫明那是抽樣，不是名冊——全台沒有官方的親子餐廳認證。`,
            ]}
          />
        </Section>

        <Section title="這不是醫療建議" tinted>
          <P>
            這裡的內容整理自政府與醫療院所的公開衛教資料，是為了讓你在看診前後把事情想清楚。它不能取代醫師的判斷。孩子的狀況讓你不安時，請直接找醫師。
          </P>
        </Section>

        <AboutPageView0Part3
          setDetailsOpen={setDetailsOpen}
          detailsOpen={detailsOpen}
          detailsId={detailsId}
        />

        {/* pb-20 keeps the last line clear of the floating feedback button a
            signed-in parent has at the bottom right. */}
        <footer className="text-center space-y-1 pb-20">
          <p className="text-xs text-ink-faint">
            {'最後更新 '}
            {ABOUT_LAST_UPDATED}
          </p>
          <p className="text-xs text-ink-faint">
            {signedIn
              ? '發現寫錯的地方？用右下角的回報鍵告訴我們。'
              : '發現寫錯的地方？登入後可以用右下角的回報鍵告訴我們。'}
          </p>
        </footer>
      </main>
    </div>
  );
}

function AboutPageView0Part1({}: {}) {
  return (
    <Section title="我們用它做什麼">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-ink">我們會做的</h3>
          <Plain
            items={[
              '顯示給你和你邀請的家人看',
              '產生你自己要用的東西：看診摘要、週報月報、行事曆匯出',
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-ink">我們不會做的</h3>
          <Plain
            items={[
              '不販售、不交換、不用於廣告',
              '不拿孩子的紀錄訓練任何模型',
              '沒有任何後台可以把你的紀錄叫出來讀——存取規則沒有給誰這個權限',
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-ink">也要說的是</h3>
          <P>
            我們會收到匿名的使用統計：哪一頁被打開、哪一類功能被使用。裡面不會出現孩子的名字、生日，或任何一筆紀錄的內容。
          </P>
          <P>
            只有你在「回報問題」的表單上勾了讓我們回覆你，才會一起送出你的
            Google 帳號名稱與 email；沒勾就不會送。
          </P>
        </div>
      </div>
    </Section>
  );
}

function AboutPageView0Part2({}: {}) {
  return (
    <Section title="畫面上的數字，都寫得出出處">
      <dl className="grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-4">
        {COVERAGE.map(({ value, unit }) => (
          // dt must precede dd in the markup; the number reads on top.
          <div key={unit} className="flex flex-col-reverse">
            <dt className="text-xs text-ink-faint">{unit}</dt>
            <dd className={`text-2xl font-bold tabular-nums ${theme.ink}`}>
              {NUMBER.format(value)}
            </dd>
          </div>
        ))}
      </dl>

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="space-y-2 pt-1"
      >
        {DATA_SOURCES.map((source) => (
          <motion.li
            key={`${source.agency}-${source.dataset}`}
            variants={listItem}
            className="card space-y-1"
          >
            <p className="text-xs text-ink-faint">{source.agency}</p>
            <h3 className="text-ink">{source.dataset}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              {source.what}
            </p>
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-ink-faint">
                {'查證 '}
                {source.verifiedOn}
              </span>
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 min-h-tap px-2 -mr-2 text-sm font-medium ${theme.ink}`}
              >
                開啟原始資料
                {/* The one icon on the page: it says the link leaves the app. */}
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}

function AboutPageView0Part3({
  setDetailsOpen,
  detailsOpen,
  detailsId,
}: {
  setDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  detailsOpen: boolean;
  detailsId: string;
}) {
  return (
    <div className="panel">
      <button
        type="button"
        onClick={() => setDetailsOpen(!detailsOpen)}
        aria-expanded={detailsOpen}
        aria-controls={detailsId}
        className={
          'w-full min-h-tap flex items-center justify-between gap-2 '
          + 'text-left text-sm text-ink-muted'
        }
      >
        想看細節的話
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-ink-faint transition-transform ${
            detailsOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div {...collapse} id={detailsId} className="overflow-hidden">
            <div className="pt-3">
              <Plain
                items={[
                  '資料庫的存取規則是唯一的授權邊界，每一次改動都要通過一組對著真實資料庫跑的測試。',
                  '裝置上能存的欄位是一份封閉清單，有測試盯著它不會被偷偷加寬。',
                  '每一筆資料來源都必須是政府或國際組織的網域，有測試擋掉部落格與社團轉貼。',
                  '這一頁上的每一個數字，都有測試對著真正的資料檔比對。',
                  '使用統計的每一個事件能帶哪些欄位，有測試釘死，多一個欄位就紅。',
                ]}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AboutIntro() {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className={`panel ${theme.tint} space-y-3`}
    >
      {/* The AppBar already carries the page's h1. This is the tagline, set
              large but kept out of the heading outline so no heading sits
              visually above the one that names the page. Each clause is its
              own inline-block so a narrow screen breaks between them, not
              mid-phrase — CJK text has no word boundaries to break on. */}
      <p className="text-xl font-bold text-ink leading-tight">
        <span className="inline-block">你的資料，</span>
        <span className="inline-block">和我們的資料</span>
      </p>
      <p className="text-base text-ink-muted leading-relaxed">
        一頁講清楚兩件事：孩子的紀錄存在哪裡、誰看得到；還有畫面上的每一個數字，是從哪一份官方資料來的。
      </p>
    </motion.header>
  );
}

function PrivacySections({ storedOnDevice }: { storedOnDevice: string[] }) {
  return (
    <>
      <Section title="孩子的紀錄，只有你和你邀請的人看得到">
        <P>
          要看或寫孩子的任何一筆紀錄，都必須先登入。沒有訪客模式，也沒有「先記在手機裡、之後再同步」。
        </P>
        <P>
          「誰能讀這個孩子」不是記在你的帳號上，而是記在孩子的檔案裡。名單上沒有你，資料庫連回都不會回——這條規則在伺服器上執行，不是在你的手機上判斷的。
        </P>
        <P>資料存放在 Google Firebase 的新加坡機房，傳輸全程走加密連線。</P>
      </Section>

      <Section title="分享給家人，也收得回來">
        <P>
          分享代碼要你自己按下才會生效。在那之前，就算代碼被貼到群組裡也加不進來。你隨時可以關掉加入，或把已經加入的帳號移除。
        </P>
        <P>
          {'有一件事想先說清楚：加入的家人和你有一樣的權限——可以記錄，也可以把其他人移除。我們沒有做主帳號和副帳號的階級'
            + '，因為一起帶孩子的兩個大人，通常不需要誰管誰。唯一的限制是名單不能空掉：最後一位成員無法把自己移除，否則這份紀'
            + '錄會變成沒有人進得去。'}
        </P>
      </Section>

      <Section title="這台裝置上，我們只留你按過的篩選">
        <P>
          存在瀏覽器裡的只有：
          {storedOnDevice.join('、')}
          。
        </P>
        <P>
          沒有名字、沒有生日、沒有任何一筆紀錄，也沒有孩子的編號。登出之後，這台裝置上不會留下孩子的任何資料。
        </P>
      </Section>
    </>
  );
}
