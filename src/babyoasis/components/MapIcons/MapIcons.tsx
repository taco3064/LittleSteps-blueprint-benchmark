import L from 'leaflet';

// 兩種圖示都不隨資料變化，模組層建立一次即可。先前是每個 marker 各呼叫一次
// createCustomIcon，全國資料下等於每次 render 產生近四千顆內容相同的 divIcon。
//
// Hex is unavoidable here — Leaflet builds these from an HTML string, outside
// Tailwind's reach. The values are the `primary` and `secondary-dark` tokens.
//
// The glyph used to be a music note (`M9 18V5l12-2v13` plus two circles), which
// had nothing to do with a nursing room. It is a droplet now.
export const ROOM_ICON = L.divIcon({
  html: `<div style="background: linear-gradient(135deg, #FFB3B3, #F08287); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(63,58,56,0.28); display: flex; align-items: center; justify-content: center;">
         <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>
       </div>`,
  // className 要留空字串，不能整個省略：省略時 Leaflet 會套上預設的
  // leaflet-div-icon，而 leaflet.css 那條規則會在圓點後面畫一個白底方框。
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const USER_ICON = L.divIcon({
  html: `<div style="background: #2A7288; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(63,58,56,0.28);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// 選定捷運站的位置。空心環而不是實心點：它標的是「你要去的地方」，不是一筆
// 哺乳室也不是你現在的位置，三者在同一張地圖上必須分得出來。
//
// Hex is unavoidable here too; the value is the `secondary-dark` token.
export const STATION_ICON = L.divIcon({
  html: `<div style="width: 26px; height: 26px; border-radius: 50%; border: 5px solid #2A7288; background: white; box-shadow: 0 2px 8px rgba(63,58,56,0.28);"></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

/**
 * 群集標記的圖示：內容與 leaflet.markercluster 的預設值完全相同，只多一個
 * data-testid。
 *
 * 群集是外掛在執行時動態產生的 DivIcon，既不是按鈕也沒有可及名稱，E2E 要
 * 確認「地圖上真的有畫出群集」時沒有別的選法（見 docs/E2E_TEST_PLAN.md §6）。
 * 分級的門檻（10、100）與 40px 的尺寸都照抄預設，換掉的只有 html 這一行。
 *
 * 這段 HTML 是字串，在 Tailwind 的掃描範圍外，樣式仍由外掛自己的 CSS 負責。
 */
export const CLUSTER_ICON = (cluster: { getChildCount: () => number }) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';

  return L.divIcon({
    html: `<div data-testid="oasis-map-cluster"><span>${count}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(40, 40),
  });
};
