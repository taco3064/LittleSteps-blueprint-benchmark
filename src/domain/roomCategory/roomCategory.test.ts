import { describe, it, expect } from 'vitest';
import type { NursingRoom } from '../records';
import {
  ACCESS_LABEL,
  accessOf,
  CATEGORY_CHIPS,
  categoryOf,
  isInternalVenue,
  needsStaffHelp,
  type RoomCategory,
} from './roomCategory';

/**
 * The classification reads a registered venue name, and registered names in
 * this dataset are corporate: a department store, a metro station and a
 * factory can all be a 股份有限公司. The rule table is ordered so the
 * public-facing category wins, and that order is the thing worth protecting —
 * reorder the table and the map starts telling parents that 新光三越 is a
 * private workplace they cannot enter.
 */

const room = (fields: Partial<NursingRoom>): NursingRoom => ({
  id: 'r1',
  name: '哺乳室',
  address: '臺北市中正區某路 1 號',
  city: '臺北市',
  latitude: 25,
  longitude: 121.5,
  ...fields,
});

describe('categoryOf', () => {
  it(
    'reads a department store as shopping, not as the corporation it '
    + 'is registered as',
    () => {
      expect(
        categoryOf(room({ name: '新光三越百貨股份有限公司台北天母分公司' })),
      ).toBe('shopping');
    },
  );

  it(
    'reads a metro station as transport, not as the corporation it is '
    + 'registered as',
    () => {
      expect(categoryOf(room({ name: '臺北大眾捷運股份有限公司-劍潭站' }))).toBe(
        'transport',
      );
    },
  );

  it('reads a factory as a workplace', () => {
    expect(categoryOf(room({ name: '鴻海精密工業股份有限公司(虎躍廠)' }))).toBe(
      'workplace',
    );
  });

  it('reads a library as culture', () => {
    expect(categoryOf(room({ name: '臺北市立圖書館' }))).toBe('culture');
  });

  it('reads a court as government', () => {
    expect(categoryOf(room({ name: '臺灣士林地方法院' }))).toBe('government');
  });

  it('reads a school by its full registered name, not only the abbreviation', () => {
    expect(categoryOf(room({ name: '臺北市中正區忠孝國民小學' }))).toBe('school');
    expect(categoryOf(room({ name: '臺北市私立東山高級中學' }))).toBe('school');
  });

  it(
    'leaves a hotel as other, because a hotel room is not a '
    + 'destination to filter for',
    () => {
      expect(categoryOf(room({ name: '台北君品國際大酒店' }))).toBe('other');
    },
  );

  it('offers no chip for a category that can be flagged as internal', () => {
    // A chip for workplaces or campuses would invite a parent to browse rooms
    // they cannot walk into. `Record<ChipCategory, string>` already guarantees
    // every chip has a label; this is the part the type cannot state.
    const chips: readonly RoomCategory[] = CATEGORY_CHIPS;

    expect(chips).not.toContain('workplace');
    expect(chips).not.toContain('school');
  });
});

describe('needsStaffHelp', () => {
  it('is true when the remarks send the parent to a service desk', () => {
    expect(needsStaffHelp(room({ remarks: '請洽服務台' }))).toBe(true);

    expect(
      needsStaffHelp(room({ remarks: '至服務台登記，由專人協助帶領及開門' })),
    ).toBe(true);
  });

  it('is false for a walk-in that merely signs a book', () => {
    // The commonest remark in the dataset. Treating a bare 登記 as staff help
    // would put the warning on 170+ rooms a parent can just walk into.
    expect(needsStaffHelp(room({ remarks: '請自行前往哺乳室並登記' }))).toBe(false);
  });

  it('is false when the source published no remarks at all', () => {
    expect(needsStaffHelp(room({}))).toBe(false);
  });
});

describe('isInternalVenue', () => {
  it('is false for a workplace that is on the statutory list', () => {
    expect(
      isInternalVenue(
        room({ name: '台灣積體電路製造股份有限公司', statutory: true }),
      ),
    ).toBe(false);
  });

  it('is true for a workplace the statutory list does not know about', () => {
    expect(isInternalVenue(room({ name: '鴻海精密工業股份有限公司(虎躍廠)' }))).toBe(
      true,
    );
  });

  it('says nothing about a public venue, whatever its statutory status', () => {
    expect(
      isInternalVenue(room({ name: '新光三越百貨股份有限公司台北天母分公司' })),
    ).toBe(false);
  });
});

describe('accessOf', () => {
  /*
    The search list shows one tag and the report sends one string. Both used to
    walk the two predicates themselves, so a change to the precedence in one
    would have left the other describing a claim the app never made.
  */
  it('prefers 內部場所 when a room is both internal and staffed', () => {
    // 「你進不去」和「你要問人」同時成立時，前者才是家長要先知道的那一件。
    const both = room({
      name: '鴻海精密工業股份有限公司(虎躍廠)',
      remarks: '請洽櫃台借用鑰匙',
    });

    expect(needsStaffHelp(both)).toBe(true);
    expect(accessOf(both)).toBe('internal');
  });

  it('falls back to 需洽服務台 for a public venue behind a desk', () => {
    expect(
      accessOf(
        room({
          name: '新光三越百貨股份有限公司台北天母分公司',
          remarks: '請洽服務台',
        }),
      ),
    ).toBe('staff_help');
  });

  it('says a walk-in is open rather than leaving it unnamed', () => {
    // 清單不畫這個標籤，但回報信裡的空白欄位會被讀成「沒有資料」而不是
    // 「直接走進去」，所以它必須有字。
    const walkIn = room({
      name: '臺北市中正區某某公園',
      remarks: '請自行前往哺乳室並登記',
    });

    expect(accessOf(walkIn)).toBe('open');
    expect(ACCESS_LABEL[accessOf(walkIn)]).toBe('沒有特別標註');
  });
});
