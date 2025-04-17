// 서버에서 받은 campground 객체를 클라이언트에서 JS 변수로 사용하기 위해 JSON으로 변환
const campground = campgroundMap;

// Leaflet 지도를 'map'이라는 id를 가진 div에 생성하고, 좌표를 기준으로 중심 설정 (위도, 경도)
const map = L.map('map').setView([
    campground.geometry.coordinates[1], // 위도 (Latitude)
    campground.geometry.coordinates[0]  // 경도 (Longitude)
], 13); // 줌 레벨 13 (도시 수준 줌)

// OpenStreetMap 타일 레이어 추가 (배경 지도)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors' // 지도 하단에 표시되는 저작권 문구
}).addTo(map);

// 캠핑장 마커 추가
L.marker([
    campground.geometry.coordinates[1], // 위도
    campground.geometry.coordinates[0]  // 경도
]).addTo(map) // 지도에 마커 추가
    .bindPopup(`<h3>${campground.title}</h3><p>${campground.location}</p>`);