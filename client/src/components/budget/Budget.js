// Budget.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import "../../css/budget.scss";
import useLocationStore from "../../store/useLocationStore";

function Budget() {
  const [peopleCount, setPeopleCount] = useState(1);
  const [price, setPrice] = useState("");
  const [userId, setUserId] = useState(null);

  const location = useLocationStore((state) => state.location);
  const navigate = useNavigate();

  useEffect(() => {
    const uid =
      localStorage.getItem("user_id") ||
      "65266fa4-89d4-496d-aea7-c22b9af0f015";
    setUserId(uid);
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!location) {
    alert("위치를 가져올 수 없습니다.");
    return;
  }

  if (!price || price.trim() === "") {
    alert("예산을 입력해주세요.");
    return;
  }

  const numericPrice = parseInt(price.replace(/[^0-9]/g, ""), 10);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    alert("유효한 예산을 입력해주세요.");
    return;
  }

  if (peopleCount <= 0) {
    alert("인원 수를 1명 이상으로 설정해주세요.");
    return;
  }

  const perPerson = numericPrice / peopleCount;
  if (perPerson < 30000) {
    alert(`1인당 최소 30,000원 이상으로 입력해주세요. (현재 1인당 ${perPerson.toLocaleString()}원)`);
    return;
  }

  try {
    const [foodRes, cafeRes, activityRes] = await Promise.all([
      fetch(
        `http://localhost:5000/api/recommend/restaurant?user_id=${userId}&lat=${location.lat}&lng=${location.lng}&radius=5000&budget=${numericPrice}&people=${peopleCount}&total_limit=25`,
        { method: "POST" }
      ).then((res) => res.json()),
      fetch(
        `http://localhost:5000/api/recommend/cafe?user_id=${userId}&lat=${location.lat}&lng=${location.lng}&radius=5000&budget=${numericPrice}&people=${peopleCount}&total_limit=25`,
        { method: "POST" }
      ).then((res) => res.json()),
      fetch(
        `http://localhost:5000/api/recommend/activity?user_id=${userId}&lat=${location.lat}&lng=${location.lng}&radius=5000`,
        { method: "POST" }
      ).then((res) => res.json()),
    ]);

    navigate("/result", {
      state: {
        userBudget: numericPrice,
        foodData: foodRes,
        cafeData: cafeRes,
        activityData: activityRes,
      },
    });
  } catch (error) {
    console.error("추천 API 호출 실패:", error);
  }
};


  return (
    <div className="budget-page">
      <Header />
      <main className="budget-main">
        <form onSubmit={handleSubmit} className="budget-form">
          <h2>예산과 인원 수를 입력해주세요</h2>

          <div className="input-group">
            <label>예산</label>
            <input
              type="text"
              placeholder="가격을 입력해주세요"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <span>원</span>
          </div>

          <div className="input-group">
            <label>인원 수</label>
            <div className="people-counter">
              <button
                type="button"
                onClick={() =>
                  setPeopleCount((prev) => Math.max(prev - 1, 1))
                }
              >
                -
              </button>
              <span>{peopleCount}</span>
              <button
                type="button"
                onClick={() => setPeopleCount((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            추천 받기
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default Budget;
