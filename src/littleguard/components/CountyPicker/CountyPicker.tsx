import { LocateFixed } from 'lucide-react';
import { useCentreSelectedChip } from '~app/platform/hooks/useCentreSelectedChip';
import { SERVICE_THEME } from '~app/portal/components/ServiceTheme';

interface Props {
  counties: string[];
  selected: string;
  onSelect: (county: string) => void;
  onLocate: () => void;
}

/**
 * 22 顆縣市 chip 加一顆定位。上次選的縣市會記在裝置上（common/preferences），
 * 所以這一列平常只是確認；第一次進來、或想換一個縣市看時，定位鈕把選縣市縮成
 * 一次點擊。失敗一律出 toast，不靜默（比照 BabyOasis）。
 *
 * 定位鈕自己一行、不併進 chip 列：`row-bleed` 的 `-mx-4` 會讓捲動區往兩側各
 * 長出 16px，跟它並排時 chip 會從按鈕底下穿出去。標題那一行本來就得有，順便
 * 給了按鈕一個位置，也讓兩列 chip 分得出哪一列是什麼。
 */
export default function CountyPicker({ counties, selected, onSelect, onLocate }: Props) {
  const theme = SERVICE_THEME.littleguard;
  const { scrollerRef, selectedRef } = useCentreSelectedChip(selected);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink-muted">看哪一個縣市</h2>
        <button
          type="button"
          onClick={onLocate}
          aria-label="用目前位置選縣市"
          className="btn-icon -mr-3"
        >
          <LocateFixed className="w-5 h-5" aria-hidden />
        </button>
      </div>
      {/* data-testid：這一列刻意橫向捲動，E2E 要單獨量它，而不是算成整頁的水平
          溢出；捲動容器沒有角色也沒有可及名稱可選（docs/E2E_TEST_PLAN.md §6）。 */}
      <div
        ref={scrollerRef}
        data-testid="scroll-row-guard-counties"
        className="row-bleed flex gap-2 py-1"
      >
        {counties.map((county) => {
          const isSelected = county === selected;

          return (
            <button
              key={county}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => onSelect(county)}
              aria-pressed={isSelected}
              // 蓋掉 `.chip-on` 的珊瑚紅填色，換成這個服務的靖藍：那個紅是
              // LittleSteps 的品牌色，擺在一頁疫情資訊上會讀成警報。留著
              // `.chip-on` 只覆蓋顏色，做法比照 LittleOuting 與 wiki 的 chip 列。
              className={`chip shrink-0 ${
                isSelected

                  ? `chip-on ${theme.fill} ${theme.fillText} border-transparent`

                  : ''
              }`}
            >
              {county}
            </button>
          );
        })}
      </div>
    </section>
  );
}
