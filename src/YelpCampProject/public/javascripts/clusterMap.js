// 서버에서 받은 campground 객체를 클라이언트에서 JS 변수로 사용하기 위해 JSON으로 변환
const campgrounds = campgroundsDataJson;

// Leaflet 지도를 'map'이라는 id를 가진 div에 생성하고, 좌표를 기준으로 중심 설정 (위도, 경도)
const map = L.map('map');

// OpenStreetMap 타일 레이어 추가 (배경 지도)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const bounds = [];

// 마커 클러스터 그룹 생성
const markerCluster = L.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 40
});

campgrounds.forEach(camp => {
  const {popUpMarkup} = camp.properties;
  if (camp.geometry && camp.geometry.coordinates) {
    const [lng, lat] = camp.geometry.coordinates;
    const marker = L.marker([lat, lng])
      .bindPopup(popUpMarkup);
    markerCluster.addLayer(marker);
    bounds.push([lat, lng]);
  }
});

map.addLayer(markerCluster);

if (bounds.length > 0) {
    map.fitBounds(bounds);
} else {
    map.setView([37.5, 127], 6);
}