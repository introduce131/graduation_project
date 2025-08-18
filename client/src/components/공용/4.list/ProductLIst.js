import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../1.header/Header";
import Footer from "../3.footer/Footer";
import css from "./../../../css/ProductList.scss";
import { FaHeart, FaRegHeart, FaInfoCircle, FaTimes, FaClock } from "react-icons/fa";

function ProductList() {
  const location = useLocation();
  const store = location.state?.store;
  const [hours, setHours] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loadingHours, setLoadingHours] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);

  // 찜 상태 확인
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
      const updatedFavorites = favorites.filter(fav => fav.place_id !== store.place_id);
      localStorage.setItem("myfavorites", JSON.stringify(updatedFavorites));
    } else {
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
      axios.get(`http://localhost:5000/api/restaurant/${store.place_id}/hours`)
        .then((res) => setHours(res.data || []))
        .catch(() => setHours([]))
        .finally(() => setLoadingHours(false));
    }
  }, [store?.place_id]);

  // 메뉴 불러오기
  useEffect(() => {
    if (store?.place_id) {
      setLoadingMenu(true);
      axios.get(`http://localhost:5000/api/restaurant/${store.place_id}`)
        .then((res) => {
          const { restaurant, menu } = res.data;
          setMenu(Array.isArray(menu) ? menu : []);
        })
        .catch((err) => {
          console.error("식당 상세 불러오기 실패:", err);
          alert("식당 데이터를 불러오는 데 실패했습니다.");
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
        {/* 가게 정보 섹션 */}
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
            
            {/* 운영시간 버튼 */}
            <button 
              onClick={() => setShowHoursModal(true)}
              className="hours-button"
            >
              <FaClock /> 운영시간 
            </button>
          </div>
        </div>

        {/* 메뉴 섹션 */}
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
                      <p>{item.menu_price.toLocaleString()}원</p>
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

      {/* 운영시간 모달 */}
      {showHoursModal && (
        <div className="modal-overlay">
          <div className="hours-modal">
            <div className="modal-header">
              <h3><FaClock /> {store.place_name} 운영시간</h3>
              <button 
                onClick={() => setShowHoursModal(false)}
                className="close-button"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              {loadingHours ? (
                <p>영업시간 정보를 불러오는 중...</p>
              ) : hours.length > 0 ? (
                <ul>
                  {hours.map((time, index) => (
                    <li key={index}>
                      <strong>{time.day}</strong>: {time.start && time.end ? 
                        `${time.start} ~ ${time.end}` : "휴무"}
                      {time.lastOrder && ` (라스트오더: ${time.lastOrder})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>영업시간 정보가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductList;