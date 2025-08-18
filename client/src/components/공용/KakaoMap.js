import { useEffect } from "react";

function KakaoMap({ latitude, longitude, stores = [] }) {
  useEffect(() => {
    if (!document.getElementById("kakao-map-script")) {
      const script = document.createElement("script");
      script.id = "kakao-map-script";
      script.src =
        "https://dapi.kakao.com/v2/maps/sdk.js?appkey=6c62a50a30c53d579dc5070b41ef9a53&autoload=false&libraries=services";
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(initMap);
      };
      document.head.appendChild(script);
    } else {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(initMap);
      }
    }

    function initMap() {
      const container = document.getElementById("map");
      if (!container) return;

      const lat = latitude || 33.450701;
      const lng = longitude || 126.570667;

      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(lat, lng),
        level: 3,
      });

      // 현재 위치 마커
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(lat, lng),
        title: "현재 위치",
      });

      // 가게 마커
      stores.forEach((store) => {
        if (!store.lat || !store.lng) return;

        const marker = new window.kakao.maps.Marker({
          map,
          position: new window.kakao.maps.LatLng(store.lat, store.lng),
          title: store.title || "가게",
        });

        const distanceStr =
          store.distance != null
            ? `<span>거리: ${store.distance.toFixed(1)}m</span><br/>`
            : "";

        const infoHtml = `
          <div style="padding:5px;min-width:120px;background:white;border:1px solid #ccc;">
            <b>${store.title || ""}</b><br/>
            ${
              store.thumbnail
                ? `<img src="${store.thumbnail}" width="80" style="margin:3px 0"/><br/>`
                : ""
            }
            ${store.price ? `<span>가격: ${store.price}</span><br/>` : ""}
            ${distanceStr}
            <span style="color:gray">${store.address || ""}</span><br/>
            <a href="https://map.kakao.com/link/map/${store.title},${store.lat},${store.lng}" target="_blank" style="color:blue;text-decoration:underline;">지도에서 보기</a>
          </div>
        `;

        const infowindow = new window.kakao.maps.InfoWindow({
          content: infoHtml,
        });

        window.kakao.maps.event.addListener(marker, "click", function () {
          infowindow.open(map, marker);
        });
      });

      // 클릭 시 위치 마커
      const clickMarker = new window.kakao.maps.Marker({ map });
      const clickInfowindow = new window.kakao.maps.InfoWindow({});

      window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        const clickLatLng = mouseEvent.latLng;
        clickMarker.setPosition(clickLatLng);

        clickInfowindow.setContent(`
          <div style="padding:5px;font-size:14px;background:white;border:1px solid gray;">
            <strong>클릭 위치</strong><br/>
            위도: ${clickLatLng.getLat().toFixed(5)}<br/>
            경도: ${clickLatLng.getLng().toFixed(5)}
          </div>
        `);
        clickInfowindow.open(map, clickMarker);
      });
    }
  }, [latitude, longitude, stores]);

  return <div id="map" style={{ width: "100%", height: "400px" }} />;
}

export default KakaoMap;
