import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";
import "../../css/mypage.scss";
import no_img from "../../images/icon/user.png";

const Mypage = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: "",
    nickname: "",
    is_guest: false,
    user_id: "",
  });

  const [recentPlaces, setRecentPlaces] = useState([]);
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 사용자 정보 불러오기
    const loadUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            email: data.email || localStorage.getItem("email") || "",
            nickname: data.nickname || localStorage.getItem("nickname") || "",
            is_guest:
              data.is_guest !== undefined
                ? data.is_guest
                : localStorage.getItem("is_guest") === "true",
            user_id: data.user_id || localStorage.getItem("user_id") || "",
          });
        } else {
          setUserInfo({
            email: localStorage.getItem("email") || "",
            nickname: localStorage.getItem("nickname") || "",
            is_guest: localStorage.getItem("is_guest") === "true",
            user_id: localStorage.getItem("user_id") || "",
          });
        }
      } catch (error) {
        console.error("사용자 정보 API 오류, localStorage fallback:", error);
        setUserInfo({
          email: localStorage.getItem("email") || "",
          nickname: localStorage.getItem("nickname") || "",
          is_guest: localStorage.getItem("is_guest") === "true",
          user_id: localStorage.getItem("user_id") || "",
        });
      } finally {
        setLoading(false);
      }
    };

    // 최근 본 장소 & 즐겨찾기 불러오기
    const loadPlaces = () => {
      let recent = [];
      try {
        const raw = localStorage.getItem("recent_views"); // 최근 본 가게
        recent = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(recent)) recent = [];
      } catch (err) {
        console.error("최근 본 장소 파싱 오류:", err);
        recent = [];
      }
      setRecentPlaces(recent);

      let favorites = [];
      try {
        const rawFav = localStorage.getItem("myfavorites"); // 즐겨찾기
        favorites = rawFav ? JSON.parse(rawFav) : [];
        if (!Array.isArray(favorites)) favorites = [];
      } catch (err) {
        console.error("즐겨찾기 파싱 오류:", err);
        favorites = [];
      }
      setFavoritePlaces(favorites);
    };

    loadUserInfo();
    loadPlaces();
  }, []);

  const handleConvertToMember = () => {
    navigate("/signup", {
      state: { guestId: userInfo.user_id, preFilledEmail: userInfo.email },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("nickname");
    localStorage.removeItem("is_guest");
    navigate("/login");
  };

  if (loading) return <div className="mypage-loading">로딩 중...</div>;

  return (
    <>
      <Header />
      <div className="mypage-container">
        {/* 상단 프로필 */}
        <div
          className={`menu-card profile-card ${
            userInfo.is_guest ? "guest" : "member"
          }`}
        >
          <div className="menu-item">
            <img src={no_img} alt="프로필" />
            <span className="menu-text">{userInfo.nickname || "사용자"}</span>
            {userInfo.is_guest && <span className="guest-badge">게스트</span>}
          </div>
        </div>

        {/* 최근 본 장소 */}
        <div className="menu-card">
          <div className="menu-item menu-header">최근 본 장소</div>
          {recentPlaces.length === 0 ? (
            <div className="menu-item">최근 본 장소가 없습니다.</div>
          ) : (
            recentPlaces.map((place, index) => (
              <div
                className="menu-item"
                key={index}
                onClick={() =>
                  navigate("/products", { state: { store: place } })
                }
              >
                <img
                  src={place.thumbnail || no_img}
                  alt={place.place_name || ""}
                />
                <span className="menu-text">
                  {place.place_name || "이름 없음"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* 좋아요한 장소 */}
        <div className="menu-card">
          <div className="menu-item menu-header">좋아요한 장소</div>
          {favoritePlaces.length === 0 ? (
            <div className="menu-item">좋아요한 장소가 없습니다.</div>
          ) : (
            <>
              {favoritePlaces.slice(0, 5).map((place, index) => (
                <div
                  className="menu-item"
                  key={index}
                  onClick={() =>
                    navigate("/products", { state: { store: place } })
                  }
                >
                  <img
                    src={place.thumbnail || no_img}
                    alt={place.place_name || ""}
                  />
                  <span className="menu-text">
                    {place.place_name || "이름 없음"}
                  </span>
                </div>
              ))}
              {favoritePlaces.length > 5 && (
                <div className="menu-item">
                  ...외 {favoritePlaces.length - 5}개 더
                </div>
              )}
            </>
          )}
        </div>

        {/* 계정 정보 */}
        <div className="menu-card">
          <div className="menu-item menu-header">계정 정보</div>
          <div className="menu-item">
            <span className="menu-text">이메일: {userInfo.email || "없음"}</span>
          </div>
          <div className="menu-item">
            <span className="menu-text">사용자 ID: {userInfo.user_id}</span>
          </div>
          <div className="menu-item">
            <span className="menu-text">
              계정 유형: {userInfo.is_guest ? "게스트" : "정회원"}
            </span>
          </div>
        </div>

        {/* 게스트 전용: 정회원 전환 버튼 */}
        {userInfo.is_guest && (
          <button
            onClick={handleConvertToMember}
            className="convert-btn menu-item"
          >
            정회원으로 전환
          </button>
        )}

        {/* 로그인 계정만 로그아웃 표시 */}
        {!userInfo.is_guest && (
          <button onClick={handleLogout} className="logout-btn menu-item">
            로그아웃
          </button>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Mypage;
