import { Link } from "react-router-dom";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";

import bibimbap from "../../images/icon/bibimbap.png";
import dumpling from "../../images/icon/dumpling.png";
import pizza from "../../images/icon/pizza.png";
import chicken from "../../images/icon/chicken-leg2.png";
import meat from "../../images/icon/meat.png";
import sundae from "../../images/icon/sundae.png";
import tteokbokki from "../../images/icon/tteokbokki.png";
import nigiri from "../../images/icon/nigiri.png";

import korean from "../../images/coupon/한식 쿠폰.jpg";
import css from "../../css/popular_spot.scss";
import Popular_spot_list from "../공용/4.list/Popular_spot_list";
import { useState } from "react";
import Store from "../menu/Store";
import useLocationStore from "../../store/useLocationStore";

function Popular_spot() {
  const location = useLocationStore((state) => state.location);

  const [storeName, setStoreName] = useState(["가게1", "가게2"]);
  const [storeList, setStoreList] = useState([]);
  

  return (
    <div className="pop_wrap">
      {location ? (
        <p>
          위도 : {location.lat}, 경도 : {location.lng}
        </p>
      ) : (
        <p>위치 정보 불러오는 중...</p>
      )}
      <Header />
      <section className="popular-spot-section">
        <div className="coupon_image">
          <span>
            OO식당 <br />
            <br /> <br />
            현재 최대 30% <br />
            <br /> <br />
            할인중!
          </span>
          <img src={korean}></img>
        </div>

        <ul>
          <li>
            <Link className="link_tag" to="/cuisine?category=한식">
              <img src={bibimbap}></img>
              <p>한식</p>
            </Link>
          </li>
          <li>
            <Link className="link_tag" to="/cuisine?category=중식">
              <img src={dumpling}></img>
              <p>중식</p>
            </Link>
          </li>
          <li>
            <Link className="link_tag" to="/cuisine?category=양식">
              <img src={pizza}></img>
              <p>양식</p>
            </Link>
          </li>
          <li>
            <Link className="link_tag" to="/cuisine?category=치킨">
              <img src={chicken}></img>
              <p>치킨</p>
            </Link>
          </li>
          <li>
            <Link className="link_tag" to="/cuisine?category=고기">
              <img src={meat}></img>
              <p>고기</p>
            </Link>
          </li>
          <li>
            <Link className="link_tag" to="/cuisine?category=탕">
              <img src={sundae}></img>
              <p>탕</p>
            </Link>
          </li>
          <li>
            <Link className="link_tag" to="/cuisine?category=분식">
              <img src={tteokbokki}></img>
              <p>분식</p>
            </Link>
          </li>
          <li>
            <Link className="link_tag" to="/cuisine?category=일식">
              <img src={nigiri}></img>
              <p>일식</p>
            </Link>
          </li>
        </ul>

        <h1>오늘의 맛집</h1>

        <div className="flex_wrap">
          {storeName.map((store, index) => (
            <Popular_spot_list key={index} storeName={store} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Popular_spot;
