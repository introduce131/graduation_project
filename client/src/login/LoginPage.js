import React, { useState, useEffect } from "react";
import "./../css/LoginPage.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestId, setGuestId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [emailStatus, setEmailStatus] = useState(""); // 이메일 상태 메시지
  const [checkingEmail, setCheckingEmail] = useState(false); // 이메일 확인 중
  const navigate = useNavigate();
  const location = useLocation();

  // 컴포넌트 마운트 시 로컬 스토리지에서 guest_id 가져오기
  useEffect(() => {
    const savedGuestId = localStorage.getItem('guest_id');
    if (savedGuestId) {
      setGuestId(savedGuestId);
    }
  }, []);

  // 회원가입 후 전달된 이메일 주소가 있으면 자동으로 채우기
  useEffect(() => {
    if (location.state?.preFilledEmail) {
      setEmail(location.state.preFilledEmail);
    }
  }, [location.state]);

  // 이메일 변경 시 중복 확인
  useEffect(() => {
    if (email && !isGuestMode) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        checkEmailExists();
      } else {
        setEmailStatus("");
      }
    } else {
      setEmailStatus("");
    }
  }, [email, isGuestMode]);

  // 이메일 중복 확인 함수
  const checkEmailExists = async () => {
    setCheckingEmail(true);
    try {
      // 이메일 확인 API 호출 (가정)
      // 실제로는 백엔드에 이메일 확인 API가 있어야 합니다
      // 여기서는 간단히 localStorage로 확인
      const existingEmail = localStorage.getItem('email');
      if (existingEmail === email) {
        // setEmailStatus(" 이미 가입된 이메일입니다");
      } else {
        // setEmailStatus("❌ 등록되지 않은 이메일입니다");
      }
    } catch (error) {
      console.error('이메일 확인 중 오류:', error);
      setEmailStatus("");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 게스트 모드인 경우
      if (isGuestMode) {
        if (!guestId) {
          alert('게스트 ID가 없습니다. 먼저 게스트 ID를 생성해주세요.');
          setIsLoading(false);
          return;
        }

        // 게스트 로그인 처리
        localStorage.setItem('user_id', guestId);
        localStorage.setItem('is_guest', 'true');
        alert('게스트로 로그인되었습니다.');
        navigate('/');
        return;
      }

      // 일반 로그인 API 호출
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('로그인 성공:', data);
        
        // 로그인 성공 시 사용자 정보 저장
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('email', data.email);
        localStorage.setItem('nickname', data.nickname);
        localStorage.setItem('is_guest', data.is_guest.toString());
        
        // 게스트 ID가 있었다면 제거
        if (guestId) {
          localStorage.removeItem('guest_id');
        }
        
        // 메인 페이지로 이동
        alert('로그인 되었습니다.');
        navigate('/');
      } else {
        const errorData = await response.json();
        console.error('로그인 실패:', errorData);
        
        // 이메일 존재 여부에 따른 에러 메시지
        let errorMessage = '이메일 또는 비밀번호를 확인해주세요.';
        if (errorData.detail) {
          if (typeof errorData.detail === 'string' && errorData.detail.includes('존재하지')) {
            errorMessage = '등록되지 않은 이메일입니다. 회원가입을 먼저 해주세요.';
          } else {
            errorMessage = errorData.detail;
          }
        }
        
        alert(`로그인 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error('API 호출 중 오류:', error);
      alert('로그인 처리 중 오류가 발생했습니다. 서버 연결을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 게스트 ID 생성
  const generateGuestId = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/guest');
      if (response.ok) {
        const data = await response.json();
        const newGuestId = data.user_id;
        setGuestId(newGuestId);
        localStorage.setItem('guest_id', newGuestId);
        setIsGuestMode(true);
        alert('게스트 ID가 생성되었습니다. 로그인 버튼을 눌러 계속하세요.');
      } else {
        throw new Error('게스트 ID 생성 실패');
      }
    } catch (error) {
      console.error('게스트 ID 생성 실패:', error);
      alert('게스트 ID 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모드 전환
  const toggleMode = () => {
    setIsGuestMode(!isGuestMode);
    setEmailStatus(""); // 모드 전환 시 이메일 상태 초기화
    if (!isGuestMode && !guestId) {
      generateGuestId();
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* 상단 하트 로고 자리 */}
        <div className="logo-heart"></div>

        {/* 제목 */}
        <h1 className="login-title">오늘 뭐할까?</h1>

        

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="login-form">
          {!isGuestMode ? (
            <>
              <div className="input-group">
                <span className="icon">👤</span>
                <input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* 이메일 상태 표시 */}
              {emailStatus && (
                <div className={`email-status ${emailStatus.includes('✅') ? 'valid' : 'invalid'}`}>
                  {checkingEmail ? '확인 중...' : emailStatus}
                </div>
              )}

              <div className="input-group">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <div className="guest-info">
              <p>게스트 ID: {guestId || '생성 중...'}</p>
              {!guestId && (
                <button 
                  type="button" 
                  onClick={generateGuestId}
                  disabled={isLoading}
                  className="generate-guest-btn"
                >
                  게스트 ID 생성
                </button>
              )}
              <div className="input-group">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  placeholder="비밀번호 (선택사항)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || (isGuestMode && !guestId)}
          >
            {isLoading ? '처리 중...' : isGuestMode ? '게스트 로그인' : '로그인'}
          </button>
        </form>

        {/* 비밀번호 찾기 */}
        {!isGuestMode && (
          <div className="forgot-password">
            <Link to="/find-password">비밀번호 찾기</Link>
          </div>
        )}

        {/* 회원가입 버튼 */}
        <Link to="/signup" state={{ guestId: isGuestMode ? guestId : null, email: email }}>
          <button id="signup-button" disabled={isLoading}>
            회원가입
          </button>
        </Link>

        {/* 게스트 정보 표시 */}
        {guestId && (
          <div className="guest-notice">
            <p>게스트로 이용 중입니다. 회원가입 시 이 게스트 ID를 사용해 계정을 연동할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;