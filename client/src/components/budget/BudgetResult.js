import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import axios from "axios";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import "../../css/budgetResult.scss";

const BudgetResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { foodData = [], cafeData = [], activityData = [], userBudget = 0 } = location.state || {};
  const swiperRef = useRef(null);

  // 예산 계산 
  const calculateCategoryBudget = (totalBudget, ratio) => Math.floor(totalBudget * ratio);
  const FOOD_RATIO = 0.35, CAFE_RATIO = 0.30, ACTIVITY_RATIO = 0.35;
  const foodBudget = calculateCategoryBudget(userBudget, FOOD_RATIO);
  const cafeBudget = calculateCategoryBudget(userBudget, CAFE_RATIO);
  const activityBudget = calculateCategoryBudget(userBudget, ACTIVITY_RATIO);

  const getBudgetRange = (budget) => ({ min: 0, max: Math.floor(budget * 1.1) });
  const foodBudgetRange = getBudgetRange(foodBudget);
  const cafeBudgetRange = getBudgetRange(cafeBudget);
  const activityBudgetRange = getBudgetRange(activityBudget);

  // median_price 기준 평균 가격 계산
  const calculateAveragePrice = async (placeId, categoryType) => {
    if (categoryType === "activity") return 0;
    try {
      const menus = (await axios.get(`http://localhost:5000/api/menu/menu?place_id=${placeId}`)).data || [];
      const menuGroups = (await axios.get(`http://localhost:5000/api/menu/menuGroups?place_id=${placeId}`)).data || [];
      let totalPrice = 0, count = 0;
      menus.forEach(m => m.median_price > 0 && (totalPrice += m.median_price, count++));
      menuGroups.forEach(g => g.median_price > 0 && (totalPrice += g.median_price, count++));
      return count > 0 ? Math.floor(totalPrice / count) : 0;
    } catch (e) {
      console.error("평균 가격 계산 오류:", e);
      return 0;
    }
  };

  // 랜덤 선택 로직 
  const getValidRandomItem = async (items, budgetRange, categoryType, previousItems = [], maxAttempts = 20) => {
  if (!items || items.length === 0) return null;

  // 활동은 가격 검증 없이 바로 반환
  if (categoryType === "activity") {
    const filteredItems = items.filter(i => !previousItems.includes(i.place_id));
    if (filteredItems.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    return filteredItems[randomIndex];
  }

  let attempts = 0;
  let validItem = null;

  while (attempts < maxAttempts && !validItem) {
    const filteredItems = items.filter(i => 
      !previousItems.includes(i.place_id) &&
      i.median_price && i.median_price <= budgetRange.max
    );

    if (filteredItems.length === 0) break;

    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    validItem = filteredItems[randomIndex];

    attempts++;
  }

  return validItem;
};




  const [recommendationGroup, setRecommendationGroup] = useState({ food: null, cafe: null, activity: null });
  const [isLoading, setIsLoading] = useState(true);

  const generateGroup = async () => {
    setIsLoading(true);
    try {
      const [food, cafe, activity] = await Promise.all([
        getValidRandomItem(foodData, foodBudgetRange, "restaurant"),
        getValidRandomItem(cafeData, cafeBudgetRange, "cafe"),
        getValidRandomItem(activityData, activityBudgetRange, "activity")
      ]);
      setRecommendationGroup({ food, cafe, activity });
      sessionStorage.setItem('recommendationGroup', JSON.stringify({ food, cafe, activity }));
    } catch (e) {
      console.error("그룹 생성 오류:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGroup = () => {
    generateGroup();
    if (swiperRef.current && swiperRef.current.swiper) swiperRef.current.swiper.slideTo(0);
  };

  const handleCardClick = (store, categoryType) => {
    if (swiperRef.current && swiperRef.current.swiper) sessionStorage.setItem('currentSlideIndex', swiperRef.current.swiper.activeIndex);
    navigate("/products", { state: { store, categoryType } });
  };

  useEffect(() => {
    const savedGroup = sessionStorage.getItem('recommendationGroup');
    if (savedGroup) {
      setRecommendationGroup(JSON.parse(savedGroup));
      setIsLoading(false);
    } else generateGroup();
  }, []);

  const renderCard = (item, categoryType, budget) => {
    if (!item) return (
      <div className="fullscreen-card no-result">
        <div className="overlay">
          <h2>추천 장소가 없습니다</h2>
          <p>이 예산 범위({budget.toLocaleString()}원)에 맞는 장소를 찾지 못했습니다.</p>
        </div>
      </div>
    );
    return (
      <div className="fullscreen-card" onClick={() => handleCardClick(item, categoryType)} key={item.place_id} style={{ backgroundImage: `url(${item.thumbnail || "/default.png"})` }}>
        <div className="overlay">
          <h2>{item.place_name || "이름 없음"}</h2>
          <p>{item.category || "카테고리 없음"}</p>
          <div className="price-info">
            <span>평균 가격: {item.median_price ? item.median_price.toLocaleString() + "원" : "정보 없음"}</span>
            <span>예산: {budget.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="result-page">
      <Header />
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>예산에 맞는 장소를 찾고 있습니다...</p>
        </div>
      )}

      <main style={{ filter: isLoading ? "blur(2px)" : "none", pointerEvents: isLoading ? "none" : "auto" }}>
        <div className="budget-summary">
          <h2>총 예산: {userBudget.toLocaleString()}원</h2>
          <div className="budget-breakdown">
            <div className="budget-item"><span>음식</span><span>{foodBudget.toLocaleString()}원</span></div>
            <div className="budget-item"><span>카페</span><span>{cafeBudget.toLocaleString()}원</span></div>
            <div className="budget-item"><span>활동</span><span>{activityBudget.toLocaleString()}원</span></div>
          </div>
        </div>

        <Swiper ref={swiperRef} modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} spaceBetween={0} slidesPerView={1} loop={true}>
          <SwiperSlide>{renderCard(recommendationGroup.food, "restaurant", foodBudget)}</SwiperSlide>
          <SwiperSlide>{renderCard(recommendationGroup.cafe, "cafe", cafeBudget)}</SwiperSlide>
          <SwiperSlide>{renderCard(recommendationGroup.activity, "activity", activityBudget)}</SwiperSlide>
        </Swiper>

        <div className="refresh-btn-wrapper">
          <button className="refresh-btn" onClick={refreshGroup}>다른 코스 보기</button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BudgetResult;
