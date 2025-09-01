import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import "../../css/budgetResult.scss";

const BudgetResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { foodData = [], cafeData = [], activityData = [] } = location.state || {};

  const getRandomItem = (arr) =>
    arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

  const generateGroup = () => ({
    food: getRandomItem(foodData),
    cafe: getRandomItem(cafeData),
    activity: getRandomItem(activityData),
  });

  const [recommendationGroup, setRecommendationGroup] = useState(generateGroup());

  const refreshGroup = () => setRecommendationGroup(generateGroup());

  const handleCardClick = (store, categoryType) => {
    navigate("/products", { state: { store, categoryType } });
  };

  const renderCard = (item, categoryType) => {
    if (!item) return null;
    return (
      <div
        className="fullscreen-card"
        onClick={() => handleCardClick(item, categoryType)}
        key={item.place_id}
        style={{ backgroundImage: `url(${item.thumbnail || "/default.png"})` }}
      >
        <div className="overlay">
          <h2>{item.place_name || "이름 없음"}</h2>
          <p>{item.category || "카테고리 없음"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="result-page">
      <Header />
     <main>
        <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
        >
            <SwiperSlide>{renderCard(recommendationGroup.food, "restaurant")}</SwiperSlide>
            <SwiperSlide>{renderCard(recommendationGroup.cafe, "restaurant")}</SwiperSlide>
            <SwiperSlide>{renderCard(recommendationGroup.activity, "activity")}</SwiperSlide>
        </Swiper>

        {/* 화면 하단, pagination 아래 */}
        <div className="refresh-btn-wrapper">
            <button className="refresh-btn" onClick={refreshGroup}>
            💡 다른 코스 보기
            </button>
        </div>
        </main>

      <Footer />
    </div>
  );
};

export default BudgetResult;
