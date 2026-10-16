import { describe, expect, it } from 'vitest';
import {
  CLAIM_NOT_PUBLISHED,
  VENUE_REPORT_REASON_LABEL,
  venueReportContent,
  venueReportTitle,
  type VenueReportTarget,
} from './venueReport';

/**
 * What this module has to guarantee: a parent taps a reason, and the record
 * that reaches the inbox is actionable without them having typed the venue's
 * name, id or the claim they are disputing.
 *
 * The length assertions are not defensive noise. `database.rules.json`
 * validates `title` at 200 characters and `content` at 5,000, and a write that
 * exceeds either is rejected outright — a parent would tap send and lose the
 * report. A pasted essay or a 300-character registered company name has to be
 * clipped here, not at the boundary.
 */

const target = (
  overrides: Partial<VenueReportTarget> = {},
): VenueReportTarget => ({
  service: 'babyoasis',
  id: 'tpe-sogo-zhongxiao',
  name: 'SOGO 忠孝館',
  address: '臺北市大安區忠孝東路四段 45 號',
  claims: [
    { label: '開放時間', value: '11:00-21:30' },
    { label: '使用條件', value: '需洽服務台' },
  ],
  ...overrides,
});

describe('venueReportContent', () => {
  it(
    'carries the venue id, name and address, so the parent retypes '
    + 'nothing',
    () => {
      const content = venueReportContent(target(), 'gone');

      expect(content).toContain('tpe-sogo-zhongxiao');
      expect(content).toContain('SOGO 忠孝館');
      expect(content).toContain('臺北市大安區忠孝東路四段 45 號');
      expect(content).toContain(VENUE_REPORT_REASON_LABEL.gone);
    },
  );

  it(
    'carries what the screen was claiming, so the inbox knows what is '
    + 'disputed',
    () => {
      const content = venueReportContent(target(), 'hoursWrong');

      expect(content).toContain('11:00-21:30');
      expect(content).toContain('需洽服務台');
    },
  );

  it('says a claim was never published rather than sending it blank', () => {
    const content = venueReportContent(
      target({ claims: [{ label: '開放時間' }] }),
      'hoursWrong',
    );

    expect(content).toContain(`開放時間（目前資料）：${CLAIM_NOT_PUBLISHED}`);
  });

  it('names the dataset the report came from', () => {
    expect(venueReportContent(target(), 'gone')).toContain('哺乳室地圖');

    expect(
      venueReportContent(target({ service: 'littleouting' }), 'gone'),
    ).toContain('親子好去處');
  });

  it('leaves the note out when the parent typed nothing, or only spaces', () => {
    expect(venueReportContent(target(), 'gone')).not.toContain('家長補充');

    expect(venueReportContent(target(), 'gone', '   \n ')).not.toContain(
      '家長補充',
    );
  });

  it('keeps the note, trimmed, when there is one', () => {
    expect(venueReportContent(target(), 'gone', '  門鎖著  ')).toContain(
      '家長補充：門鎖著',
    );
  });

  it('stays inside the content limit the database rules enforce', () => {
    const content = venueReportContent(
      target({ name: '長'.repeat(400) }),
      'gone',
      'x'.repeat(9000),
    );

    expect(content.length).toBeLessThanOrEqual(5000);
  });
});

describe('venueReportTitle', () => {
  it(
    'names the venue and the reason, so the inbox sorts without '
    + 'opening records',
    () => {
      const title = venueReportTitle(target(), 'locationWrong');

      expect(title).toContain('SOGO 忠孝館');
      expect(title).toContain(VENUE_REPORT_REASON_LABEL.locationWrong);
    },
  );

  it('stays inside the title limit the database rules enforce', () => {
    // 「新光三越百貨股份有限公司…」-length names are the norm in this dataset.
    const title = venueReportTitle(target({ name: '長'.repeat(300) }), 'gone');

    expect(title.length).toBeLessThanOrEqual(200);
  });
});
