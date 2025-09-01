import { useEffect, useState } from "react";
import css from "../../../css/style.scss";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useLocationStore from "../../../store/useLocationStore";
import axios from "axios";

// 거리 포맷 함수
const formatDistance = (d) => {
  const num = parseFloat(d);
  if (isNaN(num)) return "";
  return num >= 1000 ? `${(num / 1000).toFixed(1)} km` : `${Math.round(num)} m`;
};

function List() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const location = useLocationStore((state) => state.location);
  const latitude = location?.lat;
  const longitude = location?.lng;
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // 서버 상태 확인 (ping)
  useEffect(() => {
    axios.get("http://localhost:5000/api/ping").catch(() => {});
  }, []);

  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      if (!latitude || !longitude) {
        console.warn("위치 정보가 아직 없습니다.");
        setCategoryLoading(false);
        return;
      }

      try {
        const params = {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
          radius: 5000, // 기본값 5km
        };
        
        const res = await axios.get("http://localhost:5000/api/category/restaurant", { params });
        
        if (res.data && Array.isArray(res.data)) {
          // API 응답에서 카테고리 이름 추출 (응답 구조에 따라 수정 필요)
          const categoryNames = res.data.map(item => 
            item.category || item.category_name || item.category_group || "기타"
          );
          
          // 중복 제거
          const uniqueCategories = [...new Set(categoryNames)];
          setCategories(uniqueCategories);
        } else {
          // API 응답이 예상과 다를 경우 기본 카테고리 사용
          setCategories([
            "한식", "중식", "치킨", "카페, 디저트", "찜,탕", "간편식",  "주류, 요리주점",
            "고기", "분식", "아시아음식", "양식", "패스트푸드", "해산물", "기타"
          ]);
        }
      } catch (err) {
        console.error("카테고리 API 요청 실패:", err);
        // API 실패 시 기본 카테고리 사용
        setCategories([
          "한식", "중식", "치킨", "카페, 디저트", "찜,탕", "간편식",  "주류, 요리주점",
          "고기", "분식", "아시아음식", "양식", "패스트푸드", "해산물", "기타"
        ]);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [latitude, longitude]);

  const fetchStoresByCategory = async (category) => {
    if (!latitude || !longitude) {
      console.warn("위치 정보가 아직 없습니다.");
      return;
    }

    try {
      setLoading(true);
      const params = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        category_group: category,
        radius: 10000,
      };
      console.log("요청 파라미터:", params);

      const res = await axios.get("http://localhost:5000/api/restaurants", { params });

      console.log("API 응답:", res.data);

      const result = Array.isArray(res.data) ? res.data : [];
      if (!result.length) {
        console.warn("받은 데이터가 비어 있습니다.");
      }

      setStores(result);
    } catch (err) {
      console.error("API 요청 실패:", err);
    } finally {
      setLoading(false);
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
    <div className="list-wrap">
      <h1>오늘의 맛집 추천</h1>

      {categoryLoading ? (
        <div className="category-loading">카테고리 로딩 중...</div>
      ) : (
        <div className="category-btns">
          {categories.map((cat) => (
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
          ))}
        </div>
      )}

      {loading ? (
        <div className="stores-loading">가게 정보 로딩 중...</div>
      ) : stores.length === 0 ? (
        <p style={{ marginTop: "20px", textAlign: "center" }}>결과가 없습니다.</p>
      ) : (
        <ul>
          {stores.map((store) => (
            <li key={store.id || store.place_id}>
              <Link to="/products" state={{ store: { ...store, type: 'restaurant' }, categoryType: 'restaurant' }}>
                <div className="img_wrap">
                  {store.thumbnail ? (
                    <img 
                      src={store.thumbnail} 
                      alt={store.title}
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
                  <p className="title">{store.place_name}</p>
                  <p className="sort">
                    {Array.isArray(store.category)
                      ? store.category.join(", ")
                      : store.category || ""}
                    {store.distance && ` / ${formatDistance(store.distance)}`}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default List;