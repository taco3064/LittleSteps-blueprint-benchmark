import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Venue } from './domain/venueModels/index';
import { venueTagLabels } from './domain/venueTags/index';
import { VenueCard } from './VenueCard';

/**
 * 這張卡唯一的工作是「不要騙家長」。
 *
 * 每一條測試守的都是一句對家長的承諾，而不是版面：低消沒寫就不要生一個
 * 「低消 $0」出來、免費就不要同時掛價、沒電話就不要給一個按了沒反應的
 * 電話鍵、查證日期一定要在。把這些寫成測試的理由是它們都會「靜靜地」壞掉
 * ——渲染不會爆，只是家長照著錯的資訊出門。
 *
 * 一律以可觀察的行為斷言（看得到的字、link 的 href、清單裡有幾項），不比對
 * class 字串：換一套 utility class 不該讓測試變紅，而把 tel: 連結刪掉必須。
 */

const venue = (overrides: Partial<Venue> = {}): Venue => ({
  id: 'v1',
  kind: 'centre',
  name: '芝山親子館',
  city: '臺北市',
  district: '士林區',
  address: '臺北市士林區克強路 28 號 1 樓',
  tags: [],
  sourceUrl: 'https://example.gov.tw/centre/1',
  verifiedOn: '2026-08-28',
  ...overrides,
});

const mapLink = () => screen.getByRole('link', { name: /地圖與導航/ });

describe('VenueCard 的費用揭露', () => {
  it('標記免費就顯示免費，且不顯示任何低消金額', () => {
    render(<VenueCard venue={venue({ tags: ['free'] })} />);

    expect(screen.getByText('免費')).toBeInTheDocument();
    expect(screen.queryByText(/低消/)).not.toBeInTheDocument();
  });

  it('免費壓過低消：兩欄打架時不會一邊寫免費一邊掛價錢', () => {
    // 餐廳改成免收低消卻沒清掉舊的 minSpend，是這份人工資料最可能出現的矛盾。
    render(
      <VenueCard
        venue={venue({ kind: 'restaurant', tags: ['free'], minSpend: 250 })}
      />,
    );

    expect(screen.getByText('免費')).toBeInTheDocument();
    expect(screen.queryByText(/低消/)).not.toBeInTheDocument();
  });

  it('有低消就把金額講出來', () => {
    render(
      <VenueCard
        venue={venue({ kind: 'restaurant', name: '忻林親子餐廳', minSpend: 250 })}
      />,
    );

    expect(screen.getByText('低消 $250')).toBeInTheDocument();
  });

  it('沒有低消資料時整個低消欄位都不出現，不會渲染成「低消 $0」或空標籤', () => {
    // 來源沒寫低消 ≠ 低消是 0。畫一個 0 出來會讓家長以為問過了。
    render(
      <VenueCard venue={venue({ kind: 'restaurant', name: '忻林親子餐廳' })} />,
    );

    expect(screen.queryByText(/低消/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });
});

describe('VenueCard 的預約揭露', () => {
  it('需預約時把「需預約」單獨講一次', () => {
    render(<VenueCard venue={venue({ tags: ['needsBooking', 'playArea'] })} />);

    // 只有一處：它有自己的一列，不會同時又被塞進設施標籤裡重複一次。
    expect(screen.getAllByText('需預約')).toHaveLength(1);
  });

  it('沒有預約資料時整張卡都不提預約', () => {
    render(<VenueCard venue={venue({ tags: ['playArea', 'indoor'] })} />);

    expect(screen.queryByText(/預約/)).not.toBeInTheDocument();
  });
});

describe('VenueCard 的出處', () => {
  it('一定畫出查證日期', () => {
    // 整份資料設計就是為了避免「有人推薦過、但沒人知道是哪一年」的清單。
    render(<VenueCard venue={venue({ verifiedOn: '2026-08-28' })} />);

    expect(screen.getByText(/資料查證於 2026年8月28日/)).toBeInTheDocument();
  });

  it('查證日期跟著資料走，不是寫死的字串', () => {
    render(<VenueCard venue={venue({ verifiedOn: '2025-01-09' })} />);

    expect(screen.getByText(/資料查證於 2025年1月9日/)).toBeInTheDocument();
  });
});

describe('VenueCard 的聯絡方式', () => {
  it('沒有電話就完全不畫電話鍵，但地圖仍在', () => {
    render(<VenueCard venue={venue({ phone: undefined })} />);

    const links = screen.getAllByRole('link');

    expect(links.filter((a) => a.getAttribute('href')?.startsWith('tel:'))).toEqual(
      [],
    );

    expect(mapLink()).toBeInTheDocument();
  });

  it('有電話就給得出可撥號的連結', () => {
    render(<VenueCard venue={venue({ phone: '02-2832-2528' })} />);

    expect(screen.getByRole('link', { name: /02-2832-2528/ })).toHaveAttribute(
      'href',
      'tel:02-2832-2528',
    );
  });

  it('地圖連結同時帶著館名與地址，並且是編碼過的', () => {
    // 只帶館名會讓同名分店導到別家；只帶地址會在門牌不精確時導錯巷子。
    const subject = venue({
      name: '芝山親子館',
      address: '臺北市士林區克強路 28 號 1 樓',
    });

    render(<VenueCard venue={subject} />);

    const href = mapLink().getAttribute('href') ?? '';

    expect(href).toContain(encodeURIComponent(subject.name));
    expect(href).toContain(encodeURIComponent(subject.address));
    expect(href).not.toContain(' ');
  });
});

describe('VenueCard 的設施標籤', () => {
  it('以 venueTagLabels 的中文顯示，不顯示原始 tag 代碼', () => {
    render(
      <VenueCard venue={venue({ tags: ['playArea', 'diaperTable', 'indoor'] })} />,
    );

    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items.map((li) => li.textContent)).toEqual([
      venueTagLabels.playArea,
      venueTagLabels.diaperTable,
      venueTagLabels.indoor,
    ]);
  });

  it('費用與預約不會被重複塞進設施標籤區', () => {
    // 這兩件事有自己的位置；混進標籤堆裡就會被其他標籤淹沒。
    render(
      <VenueCard
        venue={venue({ tags: ['free', 'needsBooking', 'playArea', 'indoor'] })}
      />,
    );

    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items.map((li) => li.textContent)).toEqual([
      venueTagLabels.playArea,
      venueTagLabels.indoor,
    ]);

    expect(screen.queryByText(venueTagLabels.free)).not.toBeInTheDocument();
  });

  it('沒有設施標籤時不畫空清單', () => {
    render(<VenueCard venue={venue({ tags: ['free'] })} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('VenueCard 的資料回報', () => {
  const reportButton = () =>
    screen.queryByRole('button', { name: /這裡的資訊不對？/ });

  it('親子館給得出回報的路，而且未登入就看得到', () => {
    // 這張卡是公開頁面，沒有 AuthProvider 就等於未登入——正是站在門口的那個人。
    render(<VenueCard venue={venue()} />);

    expect(reportButton()).toBeInTheDocument();
  });

  it('餐廳不掛回報鍵：那份資料是我們逐家查證的，不是政府名冊', () => {
    render(<VenueCard venue={venue({ kind: 'restaurant' })} />);

    expect(reportButton()).not.toBeInTheDocument();
  });
});
