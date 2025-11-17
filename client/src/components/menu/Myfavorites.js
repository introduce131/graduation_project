import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import css from "../../css/Myfavorites.scss";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";

function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // user_id 가져오기 (로그인/게스트 모두 대응)
  const getUserId = () => {
    return localStorage.getItem("user_id") || "";
  };

  // API로 좋아요 목록 로드
  const loadFavoritePlaces = async () => {
    const uid = getUserId();
    if (!uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/likes/list?user_id=${uid}`);
      const data = await res.json();
      setFavorites(data.liked_places || []);
    } catch (err) {
      console.error("좋아요 목록 API 오류:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavoritePlaces();
  }, []);

  // 찜 해제 → /api/likes (토글)
  const removeFavorite = async (placeId) => {
    try {
      const uid = getUserId();

      // 좋아요 토글 API 호출
      await fetch(
        `/api/likes?user_id=${uid}&place_id=${placeId}&place_type=restaurant`,
        { method: "POST" }
      );

      // 다시 목록 갱신
      loadFavoritePlaces();
    } catch (err) {
      console.error("좋아요 해제 오류:", err);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <>
      <Header />
      <div className="my-favorites-container">
        <h1>내 즐겨찾기 목록</h1>

        {favorites.length === 0 ? (
          <div className="empty-message">
            <p>아직 즐겨찾기한 가게가 없습니다.</p>
            <Link to="/" className="go-to-main">메인 페이지로 이동</Link>
          </div>
        ) : (
          <div className="favorites-list">
            {favorites.map((store) => (
              <div key={store.place_id} className="favorite-item">
                <Link
                  to={`/products`}
                  state={{ store }}
                  className="menu-item store-link"
                >
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
