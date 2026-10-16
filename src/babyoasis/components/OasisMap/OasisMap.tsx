import 'leaflet/dist/leaflet.css';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster';

import { FilteredAreaFocus } from '../FilteredAreaFocus';

import { LocationMarker } from '../LocationMarker';

import { CLUSTER_ICON, STATION_ICON } from '../MapIcons';

import { MARKER_ZOOM, PointFocus } from '../PointFocus';

import { nursingRoomsMeta } from '~app/knowledge/domain/nursingRoomsMeta';

import type { useBabyOasisState } from '~app/babyoasis/hooks/useBabyOasisState';

import { RoomMarkers } from '../RoomMarkers';

/** 未定位時的預設視角：涵蓋台灣本島與離島，避免看起來只有臺北有資料。 */
const TAIWAN_CENTER: [number, number] = [23.75, 120.95];

const TAIWAN_ZOOM = 8;

export function OasisMap({
  userLocation,
  selectedRoom,
  setSelectedRoom,
  nursingRooms,
  station,
  isFiltered,
  filteredRooms,
}: Pick<
  ReturnType<typeof useBabyOasisState>,
  | 'userLocation'
  | 'selectedRoom'
  | 'setSelectedRoom'
  | 'nursingRooms'
  | 'station'
  | 'isFiltered'
  | 'filteredRooms'
>) {
  return (
    <div data-testid="oasis-map" className="h-full w-full">
      <MapContainer
        center={userLocation || TAIWAN_CENTER}
        zoom={userLocation ? 15 : TAIWAN_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          // 查證日期來自 buildNursingRooms.cjs 寫出的 sidecar，關於頁讀的是同一份。
          attribution={`地圖 &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ｜ 哺乳室資料：<a href="https://data.gov.tw/dataset/23750">衛生福利部國民健康署</a>（${nursingRoomsMeta.verifiedOn} 查證）`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <LocationMarker position={userLocation} />

        {/* 選定的那一站。空心環標的是「你要去的地方」，不是一筆哺乳室。 */}
        {station && (
          <Marker
            position={[station.latitude, station.longitude]}
            icon={STATION_ICON}
            title={`捷運${station.name}站`}
          />
        )}

        {/* 選了哪一筆、或哪一站，地圖就跟過去 */}
        <PointFocus point={selectedRoom} />
        <PointFocus point={station} />

        {/* 篩了條件就把視角帶到剩下的那些點上；選定某一筆、或選定某一站時，
                讓給上面那兩個——那時家長看的是那個點，不是整個篩選範圍。 */}
        <FilteredAreaFocus
          rooms={filteredRooms}
          active={
            isFiltered
            && selectedRoom === null
            && station === null
            && filteredRooms.length > 0
            && filteredRooms.length < nursingRooms.length
          }
        />

        {/*
              全台近四千個點必須分群，否則低倍率下會糊成一片而且互相遮蔽。
              maxClusterRadius 由 50 放大到 80（Leaflet 預設值）：先前的值是為
              僅臺北 306 筆調的，在全國尺度下會分出過多小群。放到第 16 級後
              改顯示個別標記，此時同一條街的點已經分得開。
            */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={80}
          disableClusteringAtZoom={MARKER_ZOOM}
          showCoverageOnHover={false}
          iconCreateFunction={CLUSTER_ICON}
        >
          <RoomMarkers rooms={filteredRooms} onSelect={setSelectedRoom} />
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
