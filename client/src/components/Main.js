import Header from "./공용/1.header/Header";
import Footer from "./공용/3.footer/Footer";
import img from "../images/coupon/gay.jpg";
import chicken from "../images/icon/chicken-leg.png";
import plane from "../images/icon/plane.png";
import coffee from "../images/icon/coffee.png";
import dollar from "../images/icon/dollar.png";
import css from "../css/main.scss";
import ad from "../images/coupon/그라데이션.jpg";
import { BrowserRouter as Router, Routes, Route, LInk, BrowserRouter, Link } from "react-router-dom";
function Main() {
  return (
    <div className="wrap">
      <Header></Header>
      <section>
        <h1 className="title">우리 오늘 뭐할까?</h1>

        <p>저희 어플은 2030 세대들의 맞는 서비스를 제공하는 데이터 코스 추천 어플입니다</p>
        <p>알고리즘과 다른 사용자들이 추천하는 여러 장소들을 만나보세요</p>

        <button>
          {" "}
          <Link to="/budget" className="recommendation">
            코스추천
          </Link>
        </button>

        <img src={img}></img>

        <h1>오늘의 카테고리</h1>
        <div className="categories">
          <div className="categories_wrap_1">
            <div>
              {/* <a><img src={chicken}></img></a> */}
              <Link to="/store" className="link">
                <img src={chicken}></img>
              </Link>
              <p>맛집</p>
            </div>

            <div>
              {/* <a><img src={plane}></img></a> */}
              <Link to="/leisure" className="link">
                <img src={plane}></img>
              </Link>
              <p>여가</p>
            </div>
          </div>

          <div className="categories_wrap_2">
            <div>
              {/* <a><img src={coffee}></img></a> */}
              <Link to="/cuisine?category=카페,%20디저트" className="link">
                <img src={coffee}></img>
              </Link>
              <p>카페</p>
            </div>

            <div>
              {/* <a><img src={dollar}></img></a> */}
              <Link to="budget" className="link">
                <img src={dollar}></img>
              </Link>
              <p>예산</p>
            </div>
          </div>

          <a>
            <div>
              <img src={ad}></img>
              <span>
                N 월의
                <br />
                <br /> <br /> 추천코스를 <br />
                <br /> <br /> 만나보세요
              </span>
            </div>
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Main;
