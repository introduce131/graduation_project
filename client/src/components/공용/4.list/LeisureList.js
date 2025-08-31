import { useEffect, useState } from "react";

import "../../../css/Leisure.scss";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useLocationStore from "../../../store/useLocationStore";
import axios from "axios";
import Header from "../1.header/Header";
import Footer from "../3.footer/Footer";

// 기본 카테고리 (API 실패 시 사용)
const DEFAULT_CATEGORIES = [
  "게임,멀티미디어", "공방", "도서,교육", "문화,예술",
  "방탈출카페", "사진,스튜디오", "스포츠,오락", "여행,관광"
];

// 거리 포맷 함수
const formatDistance = (d) => {
  const num = parseFloat(d);
  if (isNaN(num)) return "";
  return num >= 1000 ? `${(num / 1000).toFixed(1)} km` : `${Math.round(num)} m`;
};

function LeisureList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const location = useLocationStore((state) => state.location);
  const latitude = location?.lat;
  const longitude = location?.lng;

  const [stores, setStores] = useState([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // API에서 여가 카테고리 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get("http://localhost:5000/api/category/activity");
        
        if (response.data && Array.isArray(response.data)) {
          // API 응답에서 category_group 값 추출
          const categoryNames = response.data
            .map(item => item.category_group)
            .filter(category => category && category.trim() !== '');
          
          setCategories(categoryNames.length > 0 ? categoryNames : DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error("여가 카테고리 API 요청 실패:", error);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchStoresByCategory = async (category) => {
    if (!latitude || !longitude) {
      console.warn("위치 정보가 아직 없습니다.");
      return;
    }

    setIsLoadingStores(true);
    try {
      const params = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        category_group: category,
        radius: 10000,
      };
      console.log("요청 파라미터:", params);

      // ✅ 여가 시설 API 호출 (레스토랑 대신 활동/여가 API 사용)
      const res = await axios.get("http://localhost:5000/api/activities", { params });

      console.log("API 응답:", res.data);

      const result = Array.isArray(res.data) ? res.data : [];
      setStores(result);
    } catch (err) {
      console.error("여가 시설 API 요청 실패:", err);
      setStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  };

  // 초기 카테고리 선택 시 데이터 요청
  useEffect(() => {
    if (defaultCategory && categories.includes(defaultCategory) && latitude && longitude) {
      setSelectedCategory(defaultCategory);
      fetchStoresByCategory(defaultCategory);
    }
  }, [defaultCategory, categories, latitude, longitude]);

  return (
    <div>
        <Header/>
        <div className="list-wrap">
      <h1>오늘의 여가 활동 추천</h1>

      <div className="category-btns">
        {isLoadingCategories ? (
          <div className="loading">카테고리 로딩 중...</div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "btn active" : "btn"}
              onClick={() => {
                setSelectedCategory(cat);
                navigate(`?category=${cat}`);
                fetchStoresByCategory(cat);
              }}
            >
              {cat}
            </button>
          ))
        )}
      </div>

      {isLoadingStores ? (
        <div className="loading">여가 시설 로딩 중...</div>
      ) : stores.length === 0 ? (
        <p style={{ marginTop: "20px", textAlign: "center" }}>
          {selectedCategory ? `"${selectedCategory}" 카테고리의 결과가 없습니다.` : "카테고리를 선택해주세요."}
        </p>
      ) : (
        <ul>
          {stores.map((store) => (
            <li key={store.id || store.place_id}>             
              <Link to="/products" state={{ store: { ...store, type: 'activity' },categoryType: 'activity' }}>
                <div className="img_wrap">
                  {store.thumbnail ? (
                    <img 
                      src={store.thumbnail} 
                      alt={store.place_name || store.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23eee'/%3E%3Ctext x='50%' y='50%' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23666'%3E이미지 없음%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="no_image">
                      <svg viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#eee" />
                        <text x="50%" y="50%" fontSize="16" textAnchor="middle" dominantBaseline="middle" fill="#666">이미지 없음</text>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="info">
                  <p className="title">{store.place_name || store.title}</p>
                  <p className="sort">
                    {Array.isArray(store.category)
                      ? store.category.join(", ")
                      : store.category || store.category_name || ""}
                    {store.distance && ` / ${formatDistance(store.distance)}`}
                  </p>
                  {store.address && <p className="address">{store.address}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
      <Footer/>
    </div>
  );
}

export default LeisureList;