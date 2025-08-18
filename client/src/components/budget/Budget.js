import React, { useState } from "react";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import css from "../../css/budget.scss";

function Budget() {
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedLeisure, setSelectedLeisure] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState([]);
  const [peopleCount, setPeopleCount] = useState(0);
  const [price, setPrice] = useState(""); 

  const toggleSelect = (item, type) => {
    const toggle = (prev, setFn) =>
      prev.includes(item)
        ? setFn(prev.filter((i) => i !== item))
        : setFn([...prev, item]);

    if (type === "food") toggle(selectedFood, setSelectedFood);
    else if (type === "leisure") toggle(selectedLeisure, setSelectedLeisure);
    else if (type === "cafe") toggle(selectedCafe, setSelectedCafe);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
  
    if (peopleCount === 0) {
      alert("인원 수를 1명 이상으로 설정해주세요.");
      return;
    }
  
    const perPerson = numericPrice / peopleCount;
  
    if (perPerson <= 50000) {
      alert(
        `1인당 예산이 너무 적습니다. (1인당 약 ${Math.floor(
          perPerson
        ).toLocaleString()}원)`
      );
      return;
    }
  
    console.log("총 예산:", numericPrice);
    console.log("1인당 예산:", perPerson);
    console.log("선택된 음식:", selectedFood);
    console.log("선택된 여가:", selectedLeisure);
    console.log("선택된 카페:", selectedCafe);
    console.log("인원수:", peopleCount);
  };
  
  

  return (
    <div>
      <Header />

      <section>
        <div className="budget_input">
          예산 :
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="가격을 입력해주세요"
          /> 원
        </div>

        <div className="person">
          인원수 :
          <button
            type="button"
            onClick={() =>
              setPeopleCount((prev) => (prev > 0 ? prev - 1 : 0))
            }
          >
            -
          </button>
          <span>{peopleCount}</span>
          <button type="button" onClick={() => setPeopleCount((prev) => prev + 1)}>
            +
          </button>
        </div>

        <div className="text">카테고리</div>

        <form method="POST" action="/result" onSubmit={handleSubmit}>
          <div>
            <ul className="pop">
              {[
                "한식",
                "중식",
                "양식",
                "치킨",
                "고기",
                "탕",
                "분식",
                "일식",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className={selectedFood.includes(item) ? "active" : ""}
                  onClick={() => toggleSelect(item, "food")}
                >
                  <div>{idx + 1}</div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <ul className="cafe">
              {["카페"].map((item, idx) => (
                <li
                  key={idx}
                  className={selectedCafe.includes(item) ? "active" : ""}
                  onClick={() => toggleSelect(item, "cafe")}
                >
                  <div>{idx + 1}</div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <ul className="leisure">
              {["영화", "축구", "야구", "게임", "운동", "산책"].map(
                (item, idx) => (
                  <li
                    key={idx}
                    className={selectedLeisure.includes(item) ? "active" : ""}
                    onClick={() => toggleSelect(item, "leisure")}
                  >
                    <div>{idx + 1}</div>
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <button className="submit_button" type="submit">확인</button>
        </form>
      </section>

      <Footer />
    </div>
  );
}

export default Budget;
