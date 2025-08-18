import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import css from "../../css/Myfavorites.scss";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";

function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 로컬 스토리지에서 찜 목록 불러오기
  useEffect(() => {
    const loadFavorites = () => {
      const storedFavorites = JSON.parse(localStorage.getItem("myfavorites")) || [];
      setFavorites(storedFavorites);
      setLoading(false);
    };

    loadFavorites();
  }, []);

  // 찜 제거 함수
  const removeFavorite = (placeId) => {
    const updatedFavorites = favorites.filter(fav => fav.place_id !== placeId);
    localStorage.setItem("myfavorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <>
      <Header />
      <div className="my-favorites-container">
        <h1>내 찜 목록</h1>
        
        {favorites.length === 0 ? (
          <div className="empty-message">
            <p>찜한 가게가 없습니다.</p>
            <Link to="/" className="go-to-main">메인 페이지로 이동</Link>
          </div>
        ) : (
          <div className="favorites-list">
            {favorites.map((store) => (
              <div key={store.place_id} className="favorite-item">
                <Link to={`/restaurant/${store.place_id}`} state={{ store }} className="store-link">
                  <div className="store-image">
                    {store.thumbnail ? (
                      <img src={store.thumbnail} alt={store.place_name} />
                    ) : (
                      <div className="no-image">이미지 없음</div>
                    )}
                  </div>
                  <div className="store-info">
                    <h3>{store.place_name}</h3>
                    <p className="category">{store.category}</p>
                    <p className="reviews">리뷰 {store.reviewCount || 0}개</p>
                  </div>
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    removeFavorite(store.place_id);
                  }} 
                  className="remove-btn"
                >
                  찜 해제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default MyFavorites;