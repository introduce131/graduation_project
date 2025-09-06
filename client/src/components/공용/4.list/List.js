import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useLocationStore from "../../../store/useLocationStore";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
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

  // 슬라이더 ref
  const sliderRef = useRef(null);

  // 서버 ping
  useEffect(() => {
    axios.get("http://localhost:5000/api/ping").catch(() => {});
  }, []);

  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      if (!latitude || !longitude) {
        setCategoryLoading(false);
        return;
      }
      try {
        const params = { lat: parseFloat(latitude), lng: parseFloat(longitude), radius: 5000 };
        const res = await axios.get("http://localhost:5000/api/category/restaurant", { params });
        if (res.data && Array.isArray(res.data)) {
          const uniqueCategories = [...new Set(res.data.map(item => item.category || item.category_name || item.category_group || "기타"))];
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

  const fetchStoresByCategory = async (category) => {
    if (!latitude || !longitude) return;
    try {
      setLoading(true);
      const params = { lat: parseFloat(latitude), lng: parseFloat(longitude), category_group: category, radius: 10000 };
      const res = await axios.get("http://localhost:5000/api/restaurants", { params });
      setStores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultCategory && categories.includes(defaultCategory) && latitude && longitude) {
      setSelectedCategory(defaultCategory);
      fetchStoresByCategory(defaultCategory);

      // active 탭 위치로 슬라이드 이동
      const index = categories.indexOf(defaultCategory);
      if (sliderRef.current && index >= 0) {
        sliderRef.current.slickGoTo(index);
      }
    }
  }, [defaultCategory, categories, latitude, longitude]);

  // 슬라이더 커스텀 화살표
  function NextArrow({ onClick }) { return <div className="slick-arrow next-arrow" onClick={onClick}>&gt;</div>; }
  function PrevArrow({ onClick }) { return <div className="slick-arrow prev-arrow" onClick={onClick}>&lt;</div>; }

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 5,
    slidesToScroll: 3,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="list-wrap">
      <h1>오늘의 맛집 추천</h1>

      {categoryLoading ? (
        <div className="category-loading">카테고리 로딩 중...</div>
      ) : (
        <Slider {...sliderSettings} ref={sliderRef} className="category-slider">
          {categories.map((cat, index) => (
            <div key={cat} className="category-slide">
              <button
                className={selectedCategory === cat ? "btn active" : "btn"}
                onClick={() => {
                  setSelectedCategory(cat);
                  navigate(`?category=${cat}`);
                  fetchStoresByCategory(cat);
                  // 클릭 시 active 위치로 슬라이드 이동
                  if (sliderRef.current) sliderRef.current.slickGoTo(index);
                }}
              >
                {cat}
              </button>
            </div>
          ))}
        </Slider>
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
                  {store.thumbnail ? <img src={store.thumbnail} alt={store.title} /> :
                    <div className="no_image">이미지 없음</div>}
                </div>
                <div className="info">
                  <p className="title">{store.place_name}</p>
                  <p className="sort">
                    {Array.isArray(store.category) ? store.category.join(", ") : store.category || ""}
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
