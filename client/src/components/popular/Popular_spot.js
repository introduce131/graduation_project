import { Link } from "react-router-dom";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import Popular_spot_list from "../공용/4.list/Popular_spot_list";
import css from "../../css/popular_spot.scss";
import { useState, useEffect } from "react";
import useLocationStore from "../../store/useLocationStore";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import img from "../../images/coupon/한식 쿠폰.jpg";

// 카테고리 이미지 import
import koreanImg from "./../../images/[맛집]아이콘/한식.png";
import seafoodImg from "./../../images/[맛집]아이콘/해산물.png";
import chickenImg from "./../../images/[맛집]아이콘/치킨.png";
import soupImg from "./../../images/[맛집]아이콘/찜탕.png";
import chineseImg from "./../../images/[맛집]아이콘/중식.png";
import alcoholImg from "./../../images/[맛집]아이콘/주류.png";
import japaneseImg from "./../../images/[맛집]아이콘/일식.png";
import westernImg from "./../../images/[맛집]아이콘/양식.png";
import asianImg from "./../../images/[맛집]아이콘/아시아음식.png";
// import worldImg from "./../../images/[맛집]아이콘/세계음식.png";
import bunsikImg from "./../../images/[맛집]아이콘/분식.png";
import dessertImg from "./../../images/[맛집]아이콘/디저트.png";
import dietImg from "./../../images/[맛집]아이콘/다이어트식.png";
import meatImg from "./../../images/[맛집]아이콘/고기.png";
import simpleImg from "./../../images/[맛집]아이콘/간편식.png";
import worldImg from "./../../images/[맛집]아이콘/세계음식4.png";

import fastFood from "./../../images/[맛집]아이콘/햄버거.png";
import etc from "./../../images/[맛집]아이콘/음식_기타.png"

// 카테고리 매핑
const categoryImages = {
  "한식": koreanImg,
  "중식": chineseImg,
  "양식": westernImg,
  "치킨": chickenImg,
  "고기": meatImg,
  "찜,탕": soupImg,
  "분식": bunsikImg,
  "일식": japaneseImg,
  "카페, 디저트": dessertImg,
  "패스트푸드": fastFood,
  "아시아음식": asianImg,
  "해산물": seafoodImg,
  "주류, 요리주점": alcoholImg,
  "다이어트식": dietImg,
  "간편식": simpleImg,
  "기타": etc,
  "세계음식" : worldImg,
};

// 거리 포맷
const formatDistance = (d) => {
  const num = parseFloat(d);
  if (isNaN(num)) return "";
  return num >= 1000 ? `${(num / 1000).toFixed(1)} km` : `${Math.round(num)} m`;
};

function Popular_spot() {
  const location = useLocationStore((state) => state.location);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedStores, setRecommendedStores] = useState([]);

  // 슬라이더 화살표
  function NextArrow(props) {
    const { onClick } = props;
    return <div className="slick-arrow next-arrow" onClick={onClick}>&gt;</div>;
  }
  function PrevArrow(props) {
    const { onClick } = props;
    return <div className="slick-arrow prev-arrow" onClick={onClick}>&lt;</div>;
  }

  // 카테고리 & 추천 가게 가져오기
  useEffect(() => {
    const fetchData = async () => {
      if (!location?.lat || !location?.lng) return;

      try {
        const params = { lat: parseFloat(location.lat), lng: parseFloat(location.lng), radius: 5000 };

        // 카테고리
        const resCategories = await axios.get("http://localhost:5000/api/category/restaurant", { params });
        if (resCategories.data && Array.isArray(resCategories.data)) {
          const uniqueCategories = [...new Set(resCategories.data.map(item =>
            item.category || item.category_name || item.category_group || "기타"
          ))];
          setCategories(uniqueCategories);
        }

        // 추천 가게 랜덤 2개
        const resStores = await axios.get("http://localhost:5000/api/restaurants", { params });
        if (Array.isArray(resStores.data)) {
          const shuffled = resStores.data.sort(() => 0.5 - Math.random());
          setRecommendedStores(shuffled.slice(0, 2));
        }

      } catch (err) {
        console.error("API 요청 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  // 슬라이더 설정
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    rows: 2,
    slidesPerRow: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    ],
  };

  return (
    <div className="pop_wrap">
      <Header />
      <section className="popular-spot-section">
        {/* 쿠폰 광고판 */}
        <div className="coupon_image">
          <span>
            OO식당 <br /><br /> 현재 최대 30% <br /><br /> 할인중!
          </span>
          <img src={img} alt="쿠폰 이미지" />
        </div>

        {/* 카테고리 슬라이더 */}
        {loading ? (
          <p>카테고리 불러오는 중...</p>
        ) : (
          <Slider {...sliderSettings}>
            {categories.map((cat, index) => (
              <div key={index} className="category-slide">
                <Link className="link_tag" to={`/cuisine?category=${cat}`}>
                  <img src={categoryImages[cat] || ""} alt={cat} />
                  <p>{cat}</p>
                </Link>
              </div>
            ))}
          </Slider>
        )}

        {/* 추천 가게 */}
        <h1>오늘의 맛집</h1>
        <div className="flex_wrap">
          {recommendedStores.length === 0 ? (
            <>
              <Popular_spot_list storeName="가게1" />
              <Popular_spot_list storeName="가게2" />
            </>
          ) : (
            recommendedStores.map((store, idx) => (
              <Popular_spot_list
                key={store.id || idx}
                storeName={store.place_name}
                storeDistance={formatDistance(store.distance)}
                storeThumbnail={store.thumbnail}
                storeData={store}
              />
            ))
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Popular_spot;
