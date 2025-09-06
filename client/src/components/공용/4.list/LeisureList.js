import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useLocationStore from "../../../store/useLocationStore";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Header from "../1.header/Header";
import Footer from "../3.footer/Footer";
import "../../../css/Leisure.scss";

const DEFAULT_CATEGORIES = [
  "게임,멀티미디어", "공방", "도서,교육", "문화,예술",
  "방탈출카페", "사진,스튜디오", "스포츠,오락", "여행,관광"
];

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

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get("http://localhost:5000/api/category/activity");
        if (response.data && Array.isArray(response.data)) {
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
    if (!latitude || !longitude) return;
    setIsLoadingStores(true);
    try {
      const params = { lat: parseFloat(latitude), lng: parseFloat(longitude), category_group: category, radius: 10000 };
      const res = await axios.get("http://localhost:5000/api/activities", { params });
      setStores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("여가 시설 API 요청 실패:", err);
      setStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    if (defaultCategory && categories.includes(defaultCategory) && latitude && longitude) {
      setSelectedCategory(defaultCategory);
      fetchStoresByCategory(defaultCategory);
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
    <div>
      <Header/>
      <div className="list-wrap">
        <h1>오늘의 여가 활동 추천</h1>

        {isLoadingCategories ? (
          <div className="loading">카테고리 로딩 중...</div>
        ) : (
          <Slider {...sliderSettings} className="category-slider">
            {categories.map((cat) => (
              <div key={cat} className="category-slide">
                <button
                  className={selectedCategory === cat ? "btn active" : "btn"}
                  onClick={() => {
                    setSelectedCategory(cat);
                    navigate(`?category=${cat}`);
                    fetchStoresByCategory(cat);
                  }}
                >
                  {cat}
                </button>
              </div>
            ))}
          </Slider>
        )}

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
                <Link to="/products" state={{ store: { ...store, type: 'activity' }, categoryType: 'activity' }}>
                  <div className="img_wrap">
                    {store.thumbnail ? (
                      <img src={store.thumbnail} alt={store.place_name || store.title} />
                    ) : (
                      <div className="no_image">이미지 없음</div>
                    )}
                  </div>
                  <div className="info">
                    <p className="title">{store.place_name || store.title}</p>
                    <p className="sort">
                      {Array.isArray(store.category) ? store.category.join(", ") : store.category || store.category_name || ""}
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
