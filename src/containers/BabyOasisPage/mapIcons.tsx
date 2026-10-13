import L from 'leaflet';

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
export const STATION_ICON = L.divIcon({
  html: `<div style="width: 26px; height: 26px; border-radius: 50%; border: 5px solid #2A7288; background: white; box-shadow: 0 2px 8px rgba(63,58,56,0.28);"></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export const CLUSTER_ICON = (cluster: { getChildCount: () => number }) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';

  return L.divIcon({
    html: `<div data-testid="oasis-map-cluster"><span>${count}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(40, 40),
  });
};
