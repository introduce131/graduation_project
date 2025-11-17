import { useEffect, useState } from "react";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import KakaoMap from "../공용/KakaoMap";
import useLocationStore from "../../store/useLocationStore";
import axios from "axios";

function StoreMap() {
  const location = useLocationStore((state) => state.location);
  const latitude = location?.lat;
  const longitude = location?.lng;

  const [stores, setStores] = useState([]);

  const API_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchStores = async () => {
      try {
        const res = await axios.get(`${API_URL}/list`, {
          params: {
            query: "내 주변 맛집",
            latitude,
            longitude,
          },
        });

        console.log("원본 응답:", res.data);

        // 응답 데이터 구조별로 배열 추출
        const result = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.result)
          ? res.data.result
          : [];

        const filtered = result.filter(
          (store) => store.lat && store.lng
        );

        console.log("지도에 표시할 점포:", filtered);
        setStores(filtered);
      } catch (err) {
        console.error("API 요청 실패:", err);
        setStores([]); // 에러시 빈값
      }
    };

    fetchStores();
  }, [latitude, longitude]);

  return (
    <>
      <Header />

      <p style={{ textAlign: "center", margin: "10px 0" }}>
        현재 위치: 위도 {latitude}, 경도 {longitude}
      </p>
      {latitude && longitude ? (
        stores.length > 0 ? (
          <KakaoMap latitude={latitude} longitude={longitude} stores={stores} />
        ) : (
          <p style={{ textAlign: "center", color: "gray" }}>
            표시할 가게 정보가 없습니다.
          </p>
        )
      ) : (
        <p style={{ textAlign: "center", color: "red" }}>
          위치 정보를 가져오는 중입니다...
        </p>
      )}

<KakaoMap latitude={latitude} longitude={longitude} stores={stores} />

      <Footer />
    </>
  );
}

export default StoreMap;
