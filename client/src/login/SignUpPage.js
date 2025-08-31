import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './../css/SignUpPage.scss';
import Header from '../components/공용/1.header/Header';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [birth, setBirth] = useState('2000-01-01');
  const [guestId, setGuestId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedGuestId = localStorage.getItem('guest_id');
    const stateGuestId = location.state?.guestId;
    if (stateGuestId) setGuestId(stateGuestId);
    else if (savedGuestId) setGuestId(savedGuestId);
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('올바른 이메일 형식이 아닙니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guestId && guestId !== "string" ? guestId : null,
          email,
          password,
          nickname,
          birth
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('email', data.email);
        localStorage.setItem('nickname', data.nickname);
        localStorage.setItem('birth', data.birth);
        localStorage.setItem('is_guest', 'false');
        if (guestId) localStorage.removeItem('guest_id');

        alert('회원가입 완료! 로그인해주세요.');
        navigate('/login', { state: { preFilledEmail: email } });
      } else {
        let errorMessage = '회원가입 실패: ';
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            data.detail.forEach((error, index) => {
              errorMessage += `${index > 0 ? ', ' : ''}${error.msg}`;
            });
          } else errorMessage += data.detail;
        } else if (data.error) errorMessage += data.error;
        else errorMessage += '알 수 없는 오류';

        alert(errorMessage);
      }
    } catch (err) {
      console.error('API 호출 오류:', err);
      alert('서버 연결 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header/>
      <div className="signup-container">
        <div className="signup-box">
          <h1 className="signup-title">회원가입</h1>
          {guestId && (
            <div className="guest-info-banner">
              <p>⚠️ 게스트 계정을 정식 계정으로 전환합니다</p>
              <p>게스트 ID: {guestId}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-group1">
              <input type="email" placeholder="이메일 주소" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading}/>
            </div>
            <div className="input-group1">
              <input type="text" placeholder="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} required disabled={isLoading}/>
            </div>
            <div className="input-group1">
              <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} disabled={isLoading}/>
            </div>
            <div className="input-group1">
              <input type="password" placeholder="비밀번호 확인" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required disabled={isLoading}/>
            </div>
            <div className="input-group1">
              <input type="date" value={birth} onChange={e => setBirth(e.target.value)} required disabled={isLoading}/>
            </div>

            <hr className="divider"/>
            <button type="submit" className="signup-button1" disabled={isLoading}>
              {isLoading ? '처리 중...' : guestId ? '게스트 계정 전환' : '회원가입'}
            </button>
          </form>

          <div className="link-section">
            <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
