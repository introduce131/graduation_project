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
  const {
    foodData = [],
    cafeData = [],
    activityData = [],
    userBudget = 0,
  } = location.state || {};
  const swiperRef = useRef(null);

  /* ⭐ 스플래시 화면 상태 (동그라미 로딩용) */
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500); // 1.5초
    return () => clearTimeout(timer);
  }, []);

  const categoryNameMap = {
    restaurant: "🍽 맛집 추천 결과",
    cafe: "☕ 카페 추천 결과",
    activity: "🎡 여가 활동 추천 결과",
  };

  // 🔹 현재 어떤 슬라이드(카테고리)인지
  const [currentCategory, setCurrentCategory] = useState("restaurant");
  const categoryOrder = ["restaurant", "cafe", "activity"]; // 슬라이드 순서

  // 예산 계산
  const calculateCategoryBudget = (totalBudget, ratio) =>
    Math.floor(totalBudget * ratio);
  const FOOD_RATIO = 0.35,
    CAFE_RATIO = 0.3,
    ACTIVITY_RATIO = 0.35;
  const foodBudget = calculateCategoryBudget(userBudget, FOOD_RATIO);
  const cafeBudget = calculateCategoryBudget(userBudget, CAFE_RATIO);
  const activityBudget = calculateCategoryBudget(userBudget, ACTIVITY_RATIO);

  const getBudgetRange = (budget) => ({
    min: 0,
    max: Math.floor(budget * 1.1),
  });
  const foodBudgetRange = getBudgetRange(foodBudget);
  const cafeBudgetRange = getBudgetRange(cafeBudget);
  const activityBudgetRange = getBudgetRange(activityBudget);

  // 랜덤 선택 로직
  const getValidRandomItem = async (
    items,
    budgetRange,
    categoryType,
    previousItems = [],
    maxAttempts = 20
  ) => {
    if (!items || items.length === 0) return null;

    // 활동은 가격 검증 없이 바로 반환
    if (categoryType === "activity") {
      const filtered = items.filter((i) => !previousItems.includes(i.place_id));
      if (filtered.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * filtered.length);
      return filtered[randomIndex];
    }

    let attempts = 0;
    let validItem = null;

    while (attempts < maxAttempts && !validItem) {
      const filtered = items.filter(
        (i) =>
          !previousItems.includes(i.place_id) &&
          i.median_price &&
          i.median_price <= budgetRange.max
      );
      if (filtered.length === 0) break;

      validItem = filtered[Math.floor(Math.random() * filtered.length)];
      attempts++;
    }

    return validItem;
  };

  const [recommendationGroup, setRecommendationGroup] = useState({
    food: null,
    cafe: null,
    activity: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const generateGroup = async () => {
    setIsLoading(true);
    try {
      const [food, cafe, activity] = await Promise.all([
        getValidRandomItem(foodData, foodBudgetRange, "restaurant"),
        getValidRandomItem(cafeData, cafeBudgetRange, "cafe"),
        getValidRandomItem(activityData, activityBudgetRange, "activity"),
      ]);

      const newGroup = { food, cafe, activity };
      setRecommendationGroup(newGroup);
      sessionStorage.setItem("recommendationGroup", JSON.stringify(newGroup));
    } catch (e) {
      console.error("그룹 생성 오류:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGroup = () => {
    generateGroup();
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideToLoop(0);
      setCurrentCategory("restaurant"); // 새로고침하면 다시 맛집부터
    }
  };

  const handleCardClick = (store, categoryType) => {
    if (swiperRef.current?.swiper) {
      sessionStorage.setItem(
        "currentSlideIndex",
        swiperRef.current.swiper.activeIndex
      );
    }
    navigate("/products", { state: { store, categoryType } });
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("recommendationGroup");
    if (saved) {
      setRecommendationGroup(JSON.parse(saved));
      setIsLoading(false);
    } else {
      generateGroup();
    }
  }, []);

  const renderCard = (item, categoryType, budget) => {
    if (!item) {
      return (
        <div className="fullscreen-card no-result">
          <div className="overlay">
          
            <h2>추천 장소가 없습니다</h2>
            <p>예산 {budget.toLocaleString()}원에 맞는 장소를 찾지 못했습니다.</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="fullscreen-card"
        onClick={() => handleCardClick(item, categoryType)}
        key={item.place_id}
        style={{ backgroundImage: `url(${item.thumbnail || "/default.png"})` }}
      >
        <div className="overlay">
          {/* ✅ 여기서도 카테고리 텍스트 삭제 */}
          <h2>{item.place_name || "이름 없음"}</h2>
          <p>{item.category || "카테고리 없음"}</p>

          <div className="price-info">
            <span>
              평균 가격:{" "}
              {item.median_price
                ? item.median_price.toLocaleString() + "원"
                : "정보 없음"}
            </span>
            <span> 예산: {budget.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="result-page">
      <Header />

      {/* ⭐ 동그라미 스플래시 (1.5초) */}
      {showSplash && (
        <div className="splash-circle-loader">
          <div className="circle-loader" />
        </div>
      )}

      {/* 스플래시 끝난 뒤 콘텐츠 표시 */}
      {!showSplash && (
        <>
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>예산에 맞는 장소를 찾고 있습니다...</p>
            </div>
          )}

          <main
            style={{
              filter: isLoading ? "blur(2px)" : "none",
              pointerEvents: isLoading ? "none" : "auto",
            }}
          >
            {/* ✅ 슬라이드 바깥에 카테고리 라벨 표시 */}
            <p className="slide-category-label">
              {categoryNameMap[currentCategory]}
            </p>

            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              onSlideChange={(swiper) => {
                // realIndex: loop 사용 시 실제 인덱스
                const idx = swiper.realIndex % categoryOrder.length;
                setCurrentCategory(categoryOrder[idx]);
              }}
            >
              <SwiperSlide>
                {renderCard(recommendationGroup.food, "restaurant", foodBudget)}
              </SwiperSlide>
              <SwiperSlide>
                {renderCard(recommendationGroup.cafe, "cafe", cafeBudget)}
              </SwiperSlide>
              <SwiperSlide>
                {renderCard(
                  recommendationGroup.activity,
                  "activity",
                  activityBudget
                )}
              </SwiperSlide>
            </Swiper>

            <div className="refresh-btn-wrapper">
              <button className="refresh-btn" onClick={refreshGroup}>
                다른 코스 보기
              </button>
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
};

export default BudgetResult;
