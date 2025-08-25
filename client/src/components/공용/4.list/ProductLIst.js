import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../1.header/Header";
import Footer from "../3.footer/Footer";
import css from "./../../../css/ProductList.scss";
import { FaHeart, FaRegHeart, FaInfoCircle, FaTimes, FaClock, FaPhone, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useMenu, useMenuGroups } from './../useMenu';

function ProductList() {
  const location = useLocation();
  const store = location.state?.store;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [restaurantData, setRestaurantData] = useState(null);
  const [hoursData, setHoursData] = useState([]);
  const [naverMenuData, setNaverMenuData] = useState([]);
  const [naverMenuGroupsData, setNaverMenuGroupsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHours, setIsLoadingHours] = useState(true);

  

  // API 호출 함수들
  const fetchRestaurantData = async (placeId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/restaurant/${placeId}`);
      return response.data;
    } catch (error) {
      console.error("Restaurant data fetch error:", error);
      return null;
    }
  };

  const fetchRestaurantHours = async (placeId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/restaurant/${placeId}/hours`);
      return response.data || [];
    } catch (error) {
      console.error("Hours data fetch error:", error);
      return [];
    }
  };

  const fetchNaverMenu = async (placeId) => {
    try {
      const response = await axios.get(`https://place-crawling.onrender.com/menu/menu?business_id=${placeId}`);
      return response.data || [];
    } catch (error) {
      console.error("Naver menu fetch error:", error);
      return [];
    }
  };

  const fetchNaverMenuGroups = async (placeId) => {
    try {
      const response = await axios.get(`https://place-crawling.onrender.com/menu/menuGroups?business_id=${placeId}`);
      return response.data || [];
    } catch (error) {
      console.error("Naver menu groups fetch error:", error);
      return [];
    }
  };

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (!store?.place_id) return;

      setIsLoading(true);
      
      try {
        // 모든 데이터 병렬로 가져오기
        const [restaurant, hours, menu, menuGroups] = await Promise.all([
          fetchRestaurantData(store.place_id),
          fetchRestaurantHours(store.place_id),
          fetchNaverMenu(store.place_id),
          fetchNaverMenuGroups(store.place_id)
        ]);

        setRestaurantData(restaurant);
        setHoursData(hours);
        setNaverMenuData(menu);
        setNaverMenuGroupsData(menuGroups);
        
      } catch (error) {
        console.error("Data loading error:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingHours(false);
      }
    };

    loadData();
  }, [store?.place_id]);

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

  // 메뉴 데이터 통합
  const integratedMenu = () => {
    if (!store?.place_id) return [];

    let allMenus = [];

    // Restaurant 메뉴 처리 (네이버 플레이스)
    if (restaurantData?.menu && Array.isArray(restaurantData.menu)) {
      allMenus.push(...restaurantData.menu.map(item => ({
        menu_id: item.menu_id || `db-${item.menu_name}-${Math.random().toString(36).substr(2, 9)}`,
        menu_name: item.menu_name,
        menu_price: item.menu_price,
        image_url: item.image_url,
        description: item.description,
        source: 'naver_place'
      })));
    }

    // 네이버 주문 메뉴 처리
    if (Array.isArray(naverMenuData)) {
      allMenus.push(...naverMenuData.map(item => ({
        menu_id: item.menu_id || `naver-${item.menu_name}-${Math.random().toString(36).substr(2, 9)}`,
        menu_name: item.menu_name,
        menu_price: item.menu_price,
        image_url: item.image_url,
        description: item.description,
        source: 'naver_order'
      })));
    }

    // 네이버 주문 메뉴 그룹 처리
    if (Array.isArray(naverMenuGroupsData)) {
      const flattenedMenus = naverMenuGroupsData.flatMap(group => {
        if (group.menus && Array.isArray(group.menus)) {
          return group.menus.map(item => ({
            menu_id: item.menu_id || `group-${item.menu_name}-${Math.random().toString(36).substr(2, 9)}`,
            menu_name: item.menu_name,
            menu_price: item.menu_price,
            image_url: item.image_url,
            description: item.description,
            source: 'naver_order_group'
          }));
        }
        return [];
      });
      allMenus.push(...flattenedMenus);
    }

    // 중복 제거 (이름과 가격 기준)
    const uniqueMenus = allMenus.reduce((acc, current) => {
      const exists = acc.find(item => 
        item.menu_name === current.menu_name && 
        item.menu_price === current.menu_price
      );
      if (!exists) {
        return acc.concat([current]);
      }
      // 중복된 경우 더 풍부한 정보가 있는 항목 선택
      const existingIndex = acc.findIndex(item => 
        item.menu_name === current.menu_name && 
        item.menu_price === current.menu_price
      );
      if (current.image_url && !acc[existingIndex].image_url) {
        acc[existingIndex] = current;
      }
      return acc;
    }, []);

    return uniqueMenus;
  };

  const menu = integratedMenu();

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
              <span> 리뷰 {restaurantData?.restaurant?.review_count || store.reviewCount || 0}개</span>
            </p>
            
            {/* 운영시간 버튼 */}
            <button 
              onClick={() => setShowHoursModal(true)}
              className="hours-button"
            >
              <FaClock /> 가게 정보
            </button>
          </div>
        </div>

        {/* 메뉴 섹션 */}
        <div className="menu_wrap">
          <h2>가장 인기 있는 메뉴</h2>
          <p>최근 많은 분들이 주문한 메뉴</p>
          
          {isLoading ? (
            <p>메뉴 정보를 불러오는 중...</p>
          ) : menu.length > 0 ? (
            <ul>
              {menu.map((item, index) => (
                <li key={item.menu_id || index}>
                  <div>
                    <div className="img">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.menu_name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        "사진"
                      )}
                      <div className="img-fallback" style={{display: 'none'}}>
                        사진
                      </div>
                    </div>
                    <div className="menu_info">
                      <h3>{item.menu_name}</h3>
                      <p>{item.menu_price ? item.menu_price.toLocaleString() + '원' : '가격 정보 없음'}</p>
                      {item.description && (
                        <p className="menu_description">{item.description}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>메뉴 정보가 없습니다.</p>
          )}
        </div>
      </div>
      <Footer />

      {/* 가게 정보 모달 */}
      {showHoursModal && (
        <div className="modal-overlay">
          <div className="hours-modal">
            <div className="modal-header">
              <h3><FaClock /> {store.place_name} 정보</h3>
              <button 
                onClick={() => setShowHoursModal(false)}
                className="close-button"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              {/* 연락처 정보 */}
              <div className="info-section">
                <h4><FaPhone /> 연락처</h4>
                <p>{restaurantData?.restaurant?.phone || store.phone || '연락처 정보가 없습니다.'}</p>
              </div>

              {/* 위치 정보 */}
              <div className="info-section">
                <h4><FaMapMarkerAlt /> 위치</h4>
                <p className="address">{restaurantData?.restaurant?.road_address || restaurantData?.restaurant?.address || '주소 정보가 없습니다.'}</p>
                {restaurantData?.restaurant?.direction && (
                  <p className="direction">{restaurantData.restaurant.direction}</p>
                )}
              </div>

              {/* 리뷰 정보 */}
              <div className="info-section">
                <h4><FaStar /> 리뷰</h4>
                <p>리뷰 {restaurantData?.restaurant?.review_count || store.reviewCount || 0}개</p>
              </div>

              {/* 운영시간 정보 */}
              <div className="info-section">
                <h4><FaClock /> 운영시간</h4>
                {isLoadingHours ? (
                  <p>영업시간 정보를 불러오는 중...</p>
                ) : hoursData && hoursData.length > 0 ? (
                  <ul className="hours-list">
                    {hoursData.map((time, index) => (
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

              {/* 카테고리 정보 */}
              <div className="info-section">
                <h4>🍽️ 카테고리</h4>
                <p>{restaurantData?.restaurant?.category || store.category || ''}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductList;