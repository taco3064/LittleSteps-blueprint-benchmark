import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ModalFrame from '../ModalFrame';
import { collapse } from '~app/domain/motion';
import { SERVICE_THEME } from '~app/domain/serviceTheme';
import type { RadarCell, RadarData } from '~app/domain/records';
import { DISEASE_INFO, DISEASE_PART_INFO } from '~app/domain/diseases';
import {
  STATUS_COPY,
  describeGeoRatio,
  inSentence,
  describeVisits,
  formatRate,
  statusOf,
  type DiseaseCell,
} from '~app/domain/radar';
import Sparkline from '../Sparkline';

interface Props {
  disease: string;
  cell: RadarCell;
  /** 這一列底下的表現：腸病毒有兩種，其他三列沒有。 */
  parts?: readonly DiseaseCell[];
  data: RadarData;
  /** 句子要講得出地方，「這一週有 413 次就診」少了縣市就不知道是哪裡的 413。 */
  county: string;
  age: string;
  /** 資料過期時只留數字，不顯示可能已經錯的狀態。 */
  showStatus: boolean;
  onClose: () => void;
}

/**
 * 一種病一個抽屜。
 *
 * 順序是刻意的：先說這個名字在資料裡是什麼、再給可以做的事、再給什麼情況要看
 * 醫生，數字放最後。反過來的話家長會先被數字嚇一跳，才知道自己能做什麼。
 *
 * 數字那一段先用整句話講完：「台北市 0-2 歲這一週有 413 次因類流感就診，比前 8
 * 週的平常值多約 44%」與「423.0/萬」講的是同一件事，但前者不用先學單位。率、
 * 前 8 週中位數、全國同一週與分母都沒有刪掉，收在「詳細數字」裡——要核對的人
 * 打得開，只是不再是家長讀到的第一層。樣本偏小的但書不收：它修飾的是第一層
 * 那句話，收起來就等於把保留意見藏在一次點擊後面。
 *
 * 「這一週的組成」回答的是板上那行小字來不及講完的問題：手足口病與疱疹性咽峽
 * 炎不是另外兩種病，兩者相加就是腸病毒這一格，所以板上只列一項。
 *
 * showStatus 為 false（資料過期）時只收起那一行文字狀態，最近 8 週的折線留
 * 著：spec §7 收的是「可能已經錯的判斷」，折線是數字自己的圖形呈現，趨勢家長
 * 看得出來。欄位名與 DiseaseRow 一致，兩邊由 RadarPage 餵同一個表達式——板收
 * 了抽屜沒收，家長點進來就又看到一個判斷，那比不收更糟。
 *
 * 外層不再包捲動容器：ModalFrame 自己就是 AnimatePresence ＋ role="dialog"
 * ＋ max-h-[85vh] overflow-y-auto（ModalFrame.tsx:34-50），再包一層會出現
 * 兩個捲軸。
 */
export default function DiseaseDrawer({
  disease,
  cell,
  parts,
  data,
  county,
  age,
  showStatus,
  onClose,
}: Props) {
  const info = DISEASE_INFO[disease];
  const copy = STATUS_COPY[statusOf(cell)];
  const national = data.national[age]?.[disease]?.rate ?? null;
  const geo = describeGeoRatio(cell.geoRatio);

  return (
    <ModalFrame isOpen onClose={onClose} title={disease}>
      <div className="space-y-5">
        <p className="text-sm text-ink-muted">{info.meaning}</p>

        {parts && parts.length > 0 && (
          <section>
            <h3 className="text-ink font-medium mb-2">這一週的組成</h3>
            <p className="text-sm text-ink-muted">
              {`${parts.map((part) => part.disease).join('與')}都是${disease}的表現。這份資料裡兩者相加就是${disease}的全部，所以板上只列一項。`}
            </p>
            <ul className="mt-3 space-y-3">
              {parts.map((part) => (
                <li key={part.disease}>
                  <span className="flex items-baseline justify-between gap-3 text-ink">
                    <span className="font-medium">{part.disease}</span>
                    <span className="shrink-0 tabular-nums">
                      {part.cell.visits}
                      {' 人次'}
                    </span>
                  </span>
                  <span className="block text-sm text-ink-muted">
                    {DISEASE_PART_INFO[part.disease].meaning}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="text-ink font-medium mb-2">可以做什麼</h3>
          <ul className="space-y-1.5 text-ink">
            {info.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-ink font-medium mb-2">什麼情況要看醫生</h3>
          <p className="text-ink">{info.seeDoctor}</p>
        </section>

        <section>
          <h3 className="text-ink font-medium mb-2">最近 8 週</h3>
          {/* 折線用 currentColor，服務色從 serviceTheme 取，不寫死在元件裡。 */}
          <div className={SERVICE_THEME.littleguard.ink}>
            <Sparkline
              values={cell.spark}
              label={`${inSentence(disease)}最近 8 週的就診率變化`}
            />
          </div>
          {showStatus && <p className={`text-sm mt-1 ${copy.tone}`}>{copy.label}</p>}
        </section>

        <section className="space-y-1">
          <p className="text-ink">{describeVisits({ county, age, disease, cell })}</p>
          {geo && <p className="text-ink">{geo}</p>}
          {/* 但書跟著它修飾的那句話。第一層講得出「多約 44%」，就得在同一層說
              清楚那個百分比有多穩——收進「詳細數字」等於把保留意見藏起來。 */}
          {cell.reliability !== 'ok' && (
            <p className="text-sm text-ink-faint">
              這個縣市的這個年齡層每週就診人數偏少，數字容易上下跳動，看趨勢就好。
            </p>
          )}
        </section>

        <DiseaseDetails cell={cell} national={national} />

        <a
          href={info.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary w-full"
        >
          疾管署的
          {inSentence(disease)}
          說明
        </a>
      </div>
    </ModalFrame>
  );
}

function DiseaseDetails({
  cell,
  national,
}: {
  cell: RadarCell;
  national: number | null;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setDetailsOpen(!detailsOpen)}
        aria-expanded={detailsOpen}
        aria-controls={detailsId}
        className={
          'w-full min-h-tap flex items-center justify-between '
          + 'gap-2 text-left text-sm text-ink-muted'
        }
      >
        詳細數字
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-ink-faint transition-transform ${
            detailsOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div {...collapse} id={detailsId} className="overflow-hidden">
            <div className="space-y-3 pt-1">
              <dl className="text-sm text-ink-muted space-y-1">
                <div className="flex justify-between gap-3">
                  <dt>這一週</dt>
                  <dd className="tabular-nums">
                    {formatRate(cell.rate)}
                    （
                    {cell.visits}
                    {' 人次）'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>前 8 週中位數</dt>
                  <dd className="tabular-nums">{formatRate(cell.trendBase)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>全國同一週</dt>
                  <dd className="tabular-nums">{formatRate(national)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>統計基數</dt>
                  <dd className="tabular-nums">
                    {cell.denom.toLocaleString('zh-TW')}
                    {' 次門診'}
                  </dd>
                </div>
              </dl>

              {/* 「/萬」與「統計基數」都是統計用詞，不解釋的話上面那四行等於沒給。 */}
              <p className="text-sm text-ink-faint">
                「/萬」是每一萬次健保門診裡有幾次是這個病，統計基數就是那一週的門診總次數。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
