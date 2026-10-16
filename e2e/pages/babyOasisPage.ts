import type { Locator, Page } from '@playwright/test';
import { ROUTE_PATH } from "~app/portal/domain/routes";
import { MAP_CLUSTER_TESTID, MAP_TESTID, SCROLL_ROW } from '../fixtures/testIds';

/**
 * BabyOasis — the nursing-room map.
 *
 * Selectors and navigation only; the assertions live in the specs, so a reader
 * can see what is being claimed without opening a second file (plan §9).
 */
export class BabyOasisPage {
  readonly search: Locator;
  readonly map: Locator;
  readonly cluster: Locator;
  readonly filterRow: Locator;
  readonly clearSearch: Locator;
  readonly resultCount: Locator;
  readonly excludeInternalChip: Locator;
  readonly areaChip: Locator;
  readonly areaPicker: Locator;
  /**
   * Every control inside the area picker, in DOM order: `ModalFrame`'s close
   * button, then the county chips, then the districts of the county chosen.
   * The last one is therefore the last district, which is what RWD-03 needs
   * without having to name a district the upstream data may rename.
   */
  readonly areaPickerControls: Locator;
  readonly closeAreaPicker: Locator;
  readonly loadFailedTitle: Locator;
  readonly reloadRooms: Locator;
  readonly appBarSubtitle: Locator;
  readonly reportSheet: Locator;

  constructor(private readonly page: Page) {
    // `aria-label="搜尋哺乳室"` on an `input type="search"`, so the accessible
    // name carries this on its own — no testid needed or wanted.
    this.search = page.getByRole('searchbox', { name: '搜尋哺乳室' });
    this.map = page.getByTestId(MAP_TESTID);
    this.cluster = page.getByTestId(MAP_CLUSTER_TESTID);
    this.filterRow = page.getByTestId(SCROLL_ROW.oasisFilters);
    this.clearSearch = page.getByRole('button', { name: '清除搜尋' });
    // The results header, which is also the only place the total is stated:
    // the list itself renders at most thirty rows.
    this.resultCount = page.getByText(/^共 \d+ 處/);
    this.excludeInternalChip = page.getByRole('button', { name: '排除內部場所', exact: true });
    // The area chip is labelled by what it currently holds — 全部縣市 until a
    // county is picked, then the county, then the county and the district.
    this.areaChip = page.getByRole('button', { name: '全部縣市', exact: true });
    this.areaPicker = page.getByRole('dialog', { name: '選擇區域' });
    this.areaPickerControls = this.areaPicker.getByRole('button');
    this.closeAreaPicker = this.areaPicker.getByRole('button', { name: '關閉' });
    this.loadFailedTitle = page.getByRole('heading', { name: '哺乳室資料載入失敗' });
    this.reloadRooms = page.getByRole('button', { name: '重新載入' });
    // The AppBar subtitle, which is a `<p>` with no role of its own. It cannot
    // be scoped to the header either: `App.tsx` renders every route inside one
    // `<main>`, and a `<header>` nested in it is not a `banner` landmark. The
    // exact match is what separates it from the 哺乳室資料載入失敗 heading
    // below it, which contains this string.
    this.appBarSubtitle = page.getByText('資料載入失敗', { exact: true });
    this.reportSheet = page.getByRole('dialog', { name: '這裡的資訊不對？' });
  }

  async goto(): Promise<void> {
    await this.page.goto(ROUTE_PATH.babyoasis);
  }

  /** One row of the results list, by the venue name it shows. */
  resultRow(name: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: name }).getByRole('button');
  }

  /** The venue name inside a result row, on its own — it truncates, the tag does not. */
  resultName(name: string): Locator {
    return this.resultRow(name).getByText(name, { exact: true });
  }

  /** The access tag beside a result row's name. A walk-in room has none. */
  resultTag(name: string, label: string): Locator {
    return this.resultRow(name).getByText(label, { exact: true });
  }

  /** A county chip inside the area picker. */
  cityChip(city: string): Locator {
    return this.areaPicker.getByRole('button', { name: city, exact: true });
  }

  /** A district chip inside the area picker. Its name carries the room count too. */
  districtChip(district: string): Locator {
    return this.areaPicker.getByRole('button', { name: district });
  }

  /** The room detail sheet, labelled by the room's own name. */
  roomSheet(name: string): Locator {
    return this.page.getByRole('dialog', { name });
  }

  /** The report entry point inside a room's sheet. */
  reportButton(name: string): Locator {
    return this.page.getByRole('button', { name: `這裡的資訊不對？回報 ${name}` });
  }

  /**
   * One claim the report sheet is about to send, by the label it is filed
   * under — 使用條件, 開放時間.
   *
   * `<dt>`/`<dd>` are `term` and `definition` to the accessibility tree, but
   * neither says which value belongs to which label; the row around the pair
   * is what does, and it has no accessible name to select by. Hence an element
   * selector — not a class one, which §6 forbids.
   */
  reportClaim(label: string): Locator {
    return this.reportSheet.locator('dl > div').filter({ hasText: label });
  }
}
