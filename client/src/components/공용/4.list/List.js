import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useLocationStore from "../../../store/useLocationStore";
import axios from "axios";

// Swiper import
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import css from "../../../css/style.scss";

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
  
  const API_URL = process.env.REACT_APP_API_BASE_URL;

  // swiper ref
  const swiperRef = useRef(null);

  // 서버 ping
  // useEffect(() => {
  //   axios.get("/api/ping").catch(() => {});
  // }, []);

  // 카테고리 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      if (!latitude || !longitude) {
        setCategoryLoading(false);
        return;
      }
      try {
        const params = { lat: parseFloat(latitude), lng: parseFloat(longitude), radius: 5000 };
        const res = await axios.get(`${API_URL}/category/restaurant`, { params });

        if (res.data && Array.isArray(res.data)) {
          const uniqueCategories = [
            ...new Set(
              res.data.map(
                (item) => item.category || item.category_name || item.category_group || "기타"
              )
            ),
          ];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, [latitude, longitude]);

  // 카테고리별 가게 목록 가져오기
  const fetchStoresByCategory = async (category) => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      const params = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        category_group: category,
        radius: 10000,
      };

      const res = await axios.get(`${API_URL}/restaurants`, { params });
      setStores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 기본 선택 카테고리 자동 이동
  useEffect(() => {
    if (defaultCategory && categories.includes(defaultCategory)) {
      setSelectedCategory(defaultCategory);
      fetchStoresByCategory(defaultCategory);

      const index = categories.indexOf(defaultCategory);

      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideTo(index, 0);
      }
    }
  }, [defaultCategory, categories]);

  return (
    <div className="list-wrap">
      <h1>오늘의 맛집 추천</h1>

      {categoryLoading ? (
        <div className="category-loading">카테고리 로딩 중...</div>
      ) : (
        <Swiper
          modules={[Navigation]}
          navigation={true}
          slidesPerView="auto"
          spaceBetween={10}
          className="category-slider"
          ref={swiperRef}
        >
          {categories.map((cat, index) => (
            <SwiperSlide key={cat} style={{ width: "auto" }} className="category-slide">
              <button
                className={selectedCategory === cat ? "btn active" : "btn"}
                onClick={() => {
                  setSelectedCategory(cat);
                  navigate(`?category=${cat}`);
                  fetchStoresByCategory(cat);

                  if (swiperRef.current && swiperRef.current.swiper) {
                    swiperRef.current.swiper.slideTo(index);
                  }
                }}
              >
                {cat}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {loading ? (
        <div className="stores-loading">가게 정보 로딩 중...</div>
      ) : stores.length === 0 ? (
        <p style={{ marginTop: "20px", textAlign: "center" }}>결과가 없습니다.</p>
      ) : (
        <ul>
          {stores.map((store) => (
            <li key={store.id || store.place_id}>
              <Link
                to="/products"
                state={{ store: { ...store, type: "restaurant" }, categoryType: "restaurant" }}
              >
                <div className="img_wrap">
                  {store.thumbnail ? (
                    <img src={store.thumbnail} alt={store.title} />
                  ) : (
                    <div className="no_image">이미지 없음</div>
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
