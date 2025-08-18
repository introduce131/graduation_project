import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../1.header/Header";
import Footer from "../3.footer/Footer";
import css from "./../../../css/ProductList.scss";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // 하트 아이콘 임포트
//npm install react-icons

function ProductList() {
  const location = useLocation();
  const store = location.state?.store;
  const [hours, setHours] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loadingHours, setLoadingHours] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false); // 찜 상태

  // 찜 상태 확인 (로컬 스토리지에서)
  useEffect(() => {
    if (store?.place_id) {
      const favorites = JSON.parse(localStorage.getItem("myfavorites")) || [];
      setIsFavorite(favorites.some(fav => fav.place_id === store.place_id));
    }
  }, [store?.place_id]);

  // 찜 추가/제거 함수
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("myfavorites")) || [];
    
    if (isFavorite) {
      // 제거
      const updatedFavorites = favorites.filter(fav => fav.place_id !== store.place_id);
      localStorage.setItem("myfavorites", JSON.stringify(updatedFavorites));
    } else {
      // 추가
      const newFavorite = {
        place_id: store.place_id,
        place_name: store.place_name,
        thumbnail: store.thumbnail,
        category: store.category,
        reviewCount: store.reviewCount
      };
      localStorage.setItem("myfavorites", JSON.stringify([...favorites, newFavorite]));
    }
    
    setIsFavorite(!isFavorite);
  };

  // 영업시간 불러오기
  useEffect(() => {
    if (store?.place_id) {
      setLoadingHours(true);
      axios
        .get(`http://localhost:5000/api/restaurant/${store.place_id}/hours`)
        .then((res) => setHours(res.data || []))
        .catch((err) => {
          console.error("영업시간 불러오기 실패:", err.response?.data || err.message);
          setHours([]);
        })
        .finally(() => setLoadingHours(false));
    }
  }, [store?.place_id]);

  // 메뉴 불러오기
  useEffect(() => {
    if (store?.place_id) {
      setLoadingMenu(true);
      axios
        .get(`http://localhost:5000/api/restaurant/${store.place_id}`)
        .then((res) => {
          const data = res.data || {};
          setMenu(Array.isArray(data.menu) ? data.menu : []);
        })
        .catch((err) => {
          console.error("메뉴 불러오기 실패:", err.response?.data || err.message);
          setMenu([]);
        })
        .finally(() => setLoadingMenu(false));
    }
  }, [store?.place_id]);

  if (!store) {
    return <p>가게 정보를 불러올 수 없습니다.</p>;
  }

  return (
    <>
      {/* <Header/> */}
      <div className="section">
        <div className="info_wrap">
          <div className="store_img_frame">
            {store.thumbnail ? (
              <img src={store.thumbnail} alt={store.place_name} />
            ) : (
              "이미지 없음"
            )}
            {/* 하트 아이콘 */}
            <button 
              onClick={toggleFavorite}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
                color: isFavorite ? "red" : "white"
              }}
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
          <div className="store_info">
            <h2>{store.place_name}</h2>
            <p>
              {Array.isArray(store.category) ? store.category.join(", ") : store.category || ""} /{" "}
              <span>리뷰 {store.reviewCount || 0}</span>
            </p>
          </div>
        </div>

        <div className="menu_wrap">
          <h2>가장 인기 있는 메뉴</h2>
          <p>최근 많은 분들이 주문한 메뉴</p>
          
          {loadingMenu ? (
            <p>메뉴 정보를 불러오는 중...</p>
          ) : menu.length > 0 ? (
            <ul>
              {menu.map((item) => (
                <li key={item.menu_id}>
                  <Link>
                    <div className="img">
                      {item.menu_image ? (
                        <img src={item.menu_image} alt={item.menu_name} />
                      ) : (
                        "사진"
                      )}
                    </div>
                    <div className="menu_info">
                      <h3>{item.menu_name}</h3>
                      <p>{item.menu_price}원</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>메뉴 정보가 없습니다.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductList;