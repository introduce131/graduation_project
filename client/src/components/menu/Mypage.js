import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/mypage.scss"
import Header from "../공용/1.header/Header";
import Footer from "../공용/3.footer/Footer";

const Mypage = () => {
  const [userInfo, setUserInfo] = useState({
    email: "",
    nickname: "",
    is_guest: false,
    user_id: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 가져오기
  useEffect(() => {
    const loadUserInfo = () => {
      const email = localStorage.getItem('email');
      const nickname = localStorage.getItem('nickname');
      const is_guest = localStorage.getItem('is_guest') === 'true';
      const user_id = localStorage.getItem('user_id');

      setUserInfo({
        email: email || '',
        nickname: nickname || '',
        is_guest: is_guest,
        user_id: user_id || ''
      });
      
      setNewNickname(nickname || '');
    };

    loadUserInfo();
  }, []);

  // 정보 수정 모드 토글
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setMessage("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // 사용자 정보 업데이트
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // 비밀번호 확인
    if (newPassword && newPassword !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      // API 호출 (가정)
      const response = await fetch('http://localhost:5000/api/auth/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userInfo.user_id,
          nickname: newNickname,
          password: newPassword || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('nickname', newNickname);
        
        // 상태 업데이트
        setUserInfo(prev => ({ ...prev, nickname: newNickname }));
        setEditMode(false);
        setMessage("정보가 성공적으로 업데이트되었습니다.");
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || "정보 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error('정보 업데이트 중 오류:', error);
      setMessage("정보 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 게스트에서 회원 전환
  const handleConvertToMember = () => {
    navigate('/signup', { 
      state: { 
        guestId: userInfo.user_id,
        preFilledEmail: userInfo.email 
      } 
    });
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    localStorage.removeItem('nickname');
    localStorage.removeItem('is_guest');
    
    // 게스트 ID가 있으면 유지
    const guestId = localStorage.getItem('guest_id');
    if (!guestId && userInfo.is_guest) {
      localStorage.setItem('guest_id', userInfo.user_id);
    }
    
    navigate('/login');
  };

  return (
    <>
        <Header/>
            <div className="user-profile-container">
      <div className="user-profile-card">
        <h1 className="profile-title">사용자 정보</h1>
        
        <div className="profile-info">
          <div className="info-item">
            <label>이메일</label>
            <div className="value">{userInfo.email || "없음"}</div>
          </div>
          
          <div className="info-item">
            <label>사용자 ID</label>
            <div className="value">{userInfo.user_id}</div>
          </div>
          
          <div className="info-item">
            <label>계정 유형</label>
            <div className="value">
              {userInfo.is_guest ? "게스트" : "정회원"}
              {userInfo.is_guest && (
                <span className="guest-notice"> (일부 기능이 제한됩니다)</span>
              )}
            </div>
          </div>
          
          {editMode ? (
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="input-group">
                <label>닉네임</label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="새 닉네임"
                  required
                />
              </div>
              
              <div className="input-group">
                <label>새 비밀번호 (선택사항)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호"
                />
              </div>
              
              {newPassword && (
                <div className="input-group">
                  <label>비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                  />
                </div>
              )}
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  onClick={toggleEditMode}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          ) : (
            <div className="info-item">
              <label>닉네임</label>
              <div className="value">{userInfo.nickname || "설정되지 않음"}</div>
            </div>
          )}
        </div>
        
        {message && (
          <div className={`message ${message.includes('성공') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="action-buttons">
        
          
          {userInfo.is_guest && (
            <button 
              onClick={handleConvertToMember}
              className="convert-btn"
            >
              정회원으로 전환
            </button>
          )}
          
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
        <Footer/>
    </>
  );
};

export default Mypage;