import React, { useState, useEffect } from 'react';
import logo from '../../../images/logo/로고.png';
import css from '../../../css/style.scss';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [userInfo, setUserInfo] = useState(null);
  const [guestId, setGuestId] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_BASE_URL;

  // 컴포넌트 마운트 시 사용자 정보 확인
  useEffect(() => {
    checkUserLoginStatus();
    checkAndIssueGuestId();
  }, []);

  // 로컬스토리지 확인 후 게스트 ID 발급
  const checkAndIssueGuestId = async () => {
    // 1. 로컬스토리지에 user_id가 있으면 아무것도 안함
    const existingUserId = localStorage.getItem('user_id');
    if (existingUserId) {
      console.log('기존 사용자 ID 있음:', existingUserId);
      return;
    }

    // 2. 로컬스토리지에 guest_id가 있으면 사용
    const existingGuestId = localStorage.getItem('guest_id');
    if (existingGuestId) {
      console.log('기존 게스트 ID 있음:', existingGuestId);
      setGuestId(existingGuestId);
      
      // 게스트 ID를 user_id로도 설정
      localStorage.setItem('user_id', existingGuestId);
      localStorage.setItem('is_guest', 'true');
      checkUserLoginStatus();
      return;
    }

    // 3. 아무 ID도 없으면 게스트 API 호출
    try {
      console.log('게스트 ID 발급 요청');
      const response = await fetch(`${API_URL}/auth/guest`);
      
      if (response.ok) {
        const data = await response.json();
        const newGuestId = data.user_id;
        console.log('새 게스트 ID 발급:', newGuestId);
        
        // 로컬스토리지에 저장
        localStorage.setItem('guest_id', newGuestId);
        localStorage.setItem('user_id', newGuestId);
        localStorage.setItem('is_guest', 'true');
        
        setGuestId(newGuestId);
        checkUserLoginStatus();
      } else {
        console.error('게스트 API 응답 실패:', response.status);
      }
    } catch (error) {
      console.error('게스트 ID 발급 실패:', error);
    }
  };

  // 사용자 로그인 상태 확인 함수
  const checkUserLoginStatus = () => {
    const userId = localStorage.getItem('user_id');
    const email = localStorage.getItem('email');
    const nickname = localStorage.getItem('nickname');
    const isGuest = localStorage.getItem('is_guest') === 'true';

    if (userId) {
      setUserInfo({
        userId,
        email,
        nickname,
        isGuest
      });
      
      // 게스트 ID도 설정
      if (isGuest) {
        setGuestId(userId);
      }
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // 정식 회원만 로그아웃 처리, 게스트는 유지
    const isGuest = localStorage.getItem('is_guest') === 'true';
    
    if (!isGuest) {
      // 정식 회원 로그아웃
      localStorage.removeItem('user_id');
      localStorage.removeItem('email');
      localStorage.removeItem('nickname');
      localStorage.removeItem('is_guest');
      
      // 게스트 ID가 있으면 게스트 상태로 복원
      const existingGuestId = localStorage.getItem('guest_id');
      if (existingGuestId) {
        localStorage.setItem('user_id', existingGuestId);
        localStorage.setItem('is_guest', 'true');
      }
      
      setUserInfo(null);
      alert('로그아웃 되었습니다.');
      checkUserLoginStatus();
    } else {
      alert('게스트 모드입니다. 로그아웃할 필요가 없습니다.');
    }
    
    navigate('/');
  };

  // 로그인 페이지로 이동
  const handleLogin = () => {
    navigate('/login', { state: { guestId } });
  };

  // 회원가입 페이지로 이동
  const handleSignup = () => {
    navigate('/signup', { state: { guestId } });
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* 로고 및 홈 링크 */}
        <Link to="/" className="header-logo">
          <img src={logo} alt="로고" />
          <p>오늘 뭐할까?</p>
        </Link>

        {/* 사용자 정보 및 로그인/로그아웃 버튼 */}
        <div className="header-user-section">
          {userInfo ? (
            <div className="user-info">
              <span className="user-welcome">
                {userInfo.isGuest ? (
                  <>
                    <span className="guest-badge">게스트</span>
                    <span>님, 환영합니다!</span>
                    <div className="guest-upgrade-notice">
                      <Link to="/signup" state={{ guestId: userInfo.userId }}>
                        로그인
                      </Link>
                    </div>
                  </>
                ) : (
                  `${userInfo.nickname || userInfo.email}님, 환영합니다!`
                )}
              </span>
              {!userInfo.isGuest && (
                <button 
                  onClick={handleLogout} 
                  className="logout-btn"
                >
                  로그아웃
                </button>
              )}
            </div>
          ) : (
            <div className="login-section">
              <button 
                onClick={handleLogin} 
                className="login-btn"
              >
                로그인
              </button>
              <button 
                onClick={handleSignup} 
                className="signup-btn"
              >
                회원가입
              </button>
            </div>
          )}
        </div>

        
      </div>
    </header>
  );
}

export default Header;