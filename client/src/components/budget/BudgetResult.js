// ResultPage.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import "../../css/budgetResult.scss";

const BudgetResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { foodData = [], cafeData = [], activityData = [] } = location.state || {};

  useEffect(() => {
    console.log("foodData:", foodData);
    console.log("cafeData:", cafeData);
    console.log("activityData:", activityData);
  }, [foodData, cafeData, activityData]);

  // 거리 표시 함수 (m → km 변환)
  const formatDistance = (distance) => {
    if (!distance) return "";
    return `${(distance / 1000).toFixed(1)} km`;
  };

  // 카드 클릭 시 이동
  const handleCardClick = (store, categoryType) => {
    navigate("/products", { state: { store, categoryType } });
  };

  const renderCards = (items = [], categoryType = "restaurant") => {
    if (items.length === 0) {
      return <p className="no-data">추천 항목이 없습니다.</p>;
    }

    return items.map((item, idx) => (
      <div
        key={idx}
        className="card"
        onClick={() => handleCardClick(item, categoryType)}
        style={{ cursor: "pointer" }}
      >
        <img src={item.thumbnail || "/default.png"} alt={item.place_name || "이미지"} />
        <div className="info">
          <h3>{item.place_name || "이름 없음"}</h3>
          <p>{item.category || "카테고리 없음"}</p>
          {item.distance && <p>거리: {formatDistance(item.distance)}</p>}
        </div>
      </div>
    ));
  };

  return (
    <div className="result-page">
      <Header />
      <main>
        <section>
          <div className="rec">
            <span className="food_recommend">1</span><h2>음식 추천</h2>
          </div>
          <div className="card-container">{renderCards(foodData, "restaurant")}</div>
        </section>

        <section>
          <div className="rec">
            <span className="cafe_recommend">1</span><h2>카페 추천</h2>
          </div>
          <div className="card-container">{renderCards(cafeData, "restaurant")}</div>
        </section>

        <section>
          <div className="rec">
            <span className="activity_recommend">1</span><h2>활동 추천</h2>
          </div>
          <div className="card-container">{renderCards(activityData, "activity")}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BudgetResult;
