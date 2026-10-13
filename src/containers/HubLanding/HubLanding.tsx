import { motion } from 'framer-motion';
import type { User } from '~app/domain/authUser';
import { fadeInUp, hoverLift, listItem, stagger, tap } from '~app/domain/motion';
import { pressable } from '~app/domain/pressable';
import { goTo } from '~app/domain/navigate';
import { SERVICE_ORDER, SERVICE_THEME } from '~app/domain/serviceTheme';
import type { ServiceId } from '~app/domain/serviceTheme';

/**
 * HubLanding - Entry point for all six services
 *
 * Public: reachable without signing in, so a first-time visitor can see what
 * the collection offers before deciding to hand over an account.
 *
 * 這一頁是選擇器，不是六份疊起來的產品首頁。一張卡就是一列：圖示、名稱與
 * 角色、一行「做得到什麼」。整列自己就是點擊區（pressable 讓鍵盤也進得去），
 * 所以卡片裡不需要任何按鈕。名稱、角色與配色全部來自 SERVICE_THEME。
 *
 * 但選擇器也得先讓人知道自己在選什麼。這一頁原本開頭三行是「用愛陪伴，溫柔
 * 守護／每個階段都值得被用心記錄／為台灣新手爸媽量身打造」——讀完不知道這個
 * app 做什麼，而全站其他每一頁都是照著「這頁實際上有什麼」寫的。標題現在說
 * 得出這件事，六張卡也分成兩組：三個服務是跟著孩子年齡走的，一次只用一個；
 * 另外三個不分年齡，出門前打開就好。原本頁尾那條「孕期 → 新生兒 → 幼兒期」
 * 時間軸講的正是第一組，它唯一多給的資訊（年齡範圍）現在寫在卡片上，所以
 * 同一組服務不再在一頁裡出現三次。
 *
 * 登入從標題底下移到頁尾：先看得到值，再決定要不要交出帳號。回頭的訪客不必
 * 滑到底才找得到入口，右上角留一顆安靜的登入。
 */

interface HubLandingProps {
  onNavigate: (page: ServiceId) => void;
  user?: User | null;
  onSignIn?: () => Promise<void>;
  /**
   * 目前孩子所在階段對應的服務。沒有孩子（含未登入）時省略，這一頁就和以前
   * 完全一樣——入口頁是公開的，不能因為新增了這個標記而對訪客改變。
   */
  currentService?: ServiceId;
}

/**
 * 每個服務做得到什麼。
 *
 * 這幾條是整頁唯一回答「這個服務跟另外四個差在哪」的文字，所以原字不動，
 * 只從項目符號清單改成一行併排——清單的行距與縮排是卡片高度的大宗，而讀者
 * 在選服務時要的是一眼掃過去，不是逐條讀完。想看完整說明的人按進去就有：
 * 每個服務自己的首頁本來就會把同樣的能力再展開講一次。
 *
 * 數字都對得上真實資料，serviceCopy.test.ts 會逐條比對，不要憑印象改。
 */
const SERVICE_FEATURES: Record<ServiceId, string[]> = {
  littlebloom: [
    '孕期追蹤與產檢規劃',
    '專業孕期知識與營養指南',
    '14 次公費產檢時程與完成紀錄',
  ],
  littlesteps: ['里程碑追蹤與發展紀錄', '疫苗接種時程管理', '快速日誌與睡眠分析'],
  littleexplorer: [
    '12-36 個月成長檢核',
    '健檢、疫苗與塗氟提醒',
    '幼兒百科與成長日記',
  ],
  littleouting: [
    '全台 234 間親子館，依縣市與年齡查',
    '免費、需不需要預約、幾歲能去',
    '精選親子餐廳與出發前檢查清單',
  ],
  babyoasis: [
    '定位最近哺乳室',
    '詳細設施資訊',
    '一鍵導航',
    '全台 22 縣市、3,852 處',
  ],
  littleguard: [
    '七種兒童常見傳染病，看你所在縣市',
    '跟前 8 週比，這週有沒有變多',
    '資料來自疾管署健保門診統計，每週更新',
  ],
};

/**
 * 六個服務不是同一種東西。
 *
 * 前三個跟著孩子的年齡走，一次只用得到一個，孩子長大就換下一個；後三個不分
 * 年齡，而且完全公開（見 routePolicy 的公開允許清單）。六列並排時這個差別
 * 看不出來，家長只能逐列讀完再自己歸類。分組之後，第一個問題「哪一個是我
 * 的」由組標題回答，不必替每個訪客再猜一次。
 *
 * 兩組加起來必須正好是 SERVICE_ORDER：漏掉一個服務就等於那個服務沒有入口，
 * 沒有任何子應用會連到自己的手足。第二組的「都不需要登入」也是一句對得起
 * routePolicy 的承諾，不是修飾語。兩件事都由 HubLanding.test.tsx 對著來源
 * 比，所以這份常數要匯出。
 */
export const SERVICE_GROUPS: { title: string; note: string; ids: ServiceId[] }[] = [
  {
    title: '依孩子的階段',
    note: '一次看一個。孩子長大就換到下一個，紀錄留在同一個檔案裡。',
    ids: ['littlebloom', 'littlesteps', 'littleexplorer'],
  },
  {
    title: '不分年齡，隨時用得上',
    note: '都不需要登入，出門前打開就好。',
    ids: ['littleouting', 'babyoasis', 'littleguard'],
  },
];

/**
 * 三個階段服務各自的年齡範圍。
 *
 * 「寶寶成長」和「幼兒期陪伴」這兩個角色名分不出一歲三個月的孩子該進哪一個，
 * 而這正是入口頁要回答的問題。這三行原本掛在頁尾的旅程時間軸上——那條時間軸
 * 其餘的內容（三個階段名、三個服務）卡片已經講過了，所以只留這裡。
 */
const STAGE_RANGE: Partial<Record<ServiceId, string>> = {
  littlebloom: '0-40 週',
  littlesteps: '0-12 月',
  littleexplorer: '1-3 歲',
};

export default function HubLanding({
  onNavigate,
  user,
  onSignIn,
  currentService,
}: HubLandingProps) {
  return (
    <div className="screen-body-wide space-y-10">
      {/* 回頭的訪客不必為了登入滑到頁尾；安靜到不跟標題搶。 */}
      {!user && onSignIn && (
        <div className="flex justify-end">
          <button type="button" onClick={onSignIn} className="btn-ghost">
            登入
          </button>
        </div>
      )}

      {/* Hero */}
      <HubIntroduction />

      <ServiceGroups onNavigate={onNavigate} currentService={currentService} />
      {/* 這一頁最有說服力的一段，而它原本只寫在各服務自己的頁面裡。整塊就是
          進關於頁的入口——那一頁把「誰看得到孩子的紀錄」和「每個數字從哪來」
          講完整；這裡不另加一顆按鈕，也不再開第二個區塊。 */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        {...pressable(() => goTo('about'))}
        aria-label="資料從哪裡來，以及孩子的紀錄怎麼保護"
        className="panel-tap space-y-2"
      >
        <h2 className="text-ink">資料從哪裡來</h2>
        <p className="text-sm text-ink-muted leading-relaxed">
          哺乳室與親子館的名單來自國健署與社家署的開放資料，每週的疫情數字來自疾管署的健保門診統計，生長曲線用的是
          WHO 的標準。
        </p>
        <p className="text-sm text-ink-faint">
          每一頁都寫得出自己的來源與查證日期。
        </p>
        <p className={`text-sm font-medium ${SERVICE_THEME.littlesteps.ink}`}>
          看完整說明：孩子的紀錄存在哪裡、誰看得到
        </p>
      </motion.section>

      {/* 登入放在頁尾而不是標題底下：先看得到值，再決定要不要交出帳號。
          那句「不登入能看什麼」全站只有這一份，就放在按鈕旁邊。 */}
      {!user && onSignIn && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="panel text-center space-y-3"
        >
          <h2 className="text-ink">要記錄孩子的資料，才需要帳號</h2>
          <p className="text-sm text-ink-muted">
            知識內容不需登入即可閱讀；記錄功能登入後才能跨裝置同步
          </p>
          <motion.button
            type="button"
            whileHover={hoverLift}
            whileTap={tap}
            onClick={onSignIn}
            className="btn-primary"
          >
            使用 Google 登入
          </motion.button>
        </motion.section>
      )}

      <motion.p
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="text-center text-xs text-ink-faint"
      >
        {'© '}
        {new Date().getFullYear()}
        {' '}
        {SERVICE_ORDER.map((id) => SERVICE_THEME[id].name).join(' · ')}
      </motion.p>
    </div>
  );
}

function ServiceGroups({
  onNavigate,
  currentService,
}: Pick<HubLandingProps, 'onNavigate' | 'currentService'>) {
  return (
    <>
      {/* Service cards：一列一個服務，兩組 */}
      {SERVICE_GROUPS.map((group) => (
        <section key={group.title} className="space-y-3">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h2 className="text-ink">{group.title}</h2>
            <p className="text-sm text-ink-muted mt-1">{group.note}</p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {group.ids.map((id) => {
              const theme = SERVICE_THEME[id];
              const Icon = theme.icon;

              return (
                <motion.div
                  key={id}
                  variants={listItem}
                  {...pressable(() => onNavigate(id))}
                  className="card-tap flex items-start gap-3"
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 mt-0.5 ${theme.ink}`}
                    aria-hidden="true"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {/* 角色標籤放在 h3 外面：標題的可及名稱要正好是服務名。 */}
                      <h3 className={theme.ink}>{theme.name}</h3>
                      <span className={`text-xs ${theme.muted}`}>{theme.role}</span>
                      {STAGE_RANGE[id] && (
                        <span className="text-xs text-ink-faint">
                          {STAGE_RANGE[id]}
                        </span>
                      )}
                      {/* 家長第一個問題是「哪一個是我的」。組標題回答一半，這個
                          標記回答另一半；順序刻意不動，見 serviceForStage。
                          `.tag` 只給形狀不給顏色，配色要自己帶——不帶的話它就
                          只是一段有 padding 的小字，看不出是標記。 */}
                      {id === currentService && (
                        <span className={`tag ${theme.tint} ${theme.ink}`}>
                          目前階段
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${theme.body} leading-snug mt-1`}>
                      {SERVICE_FEATURES[id].join(' · ')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      ))}
    </>
  );
}

function HubIntroduction() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="text-center pt-2 sm:pt-6"
    >
      {/* 中文不斷字，所以窄螢幕上一行標題會斷在「把」跟「每」之間。每個
            意義段落各包一個 inline-block，換行就只會發生在段落之間；寬度夠時
            仍然是一行。text-wrap: balance 幫不上忙——它平均行寬，不看標點。 */}
      <motion.h1
        variants={listItem}
        className="text-3xl sm:text-4xl md:text-5xl text-ink mb-4"
      >
        <span className="inline-block">從懷孕到三歲，</span>
        <span className="inline-block">陪你把每一步記下來</span>
      </motion.h1>

      <motion.p
        variants={listItem}
        className={
          'text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl'
          + ' mx-auto'
        }
      >
        <span className="inline-block">六個服務、一個帳號。</span>
        <span className="inline-block">
          孕期到幼兒期的成長追蹤，加上出門在外用得到的哺乳室、親子館與這週的疫情。
        </span>
      </motion.p>
    </motion.div>
  );
}
