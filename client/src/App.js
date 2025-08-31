import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./components/Main";
import Popular_spot from "./components/popular/Popular_spot";
import Store from "./components/menu/Store";
import Budget from "./components/budget/Budget";
import ProductList from "./components/공용/4.list/ProductLIst";
import MyFavorites from "./components/menu/Myfavorites";
import StoreMap from "./components/menu/StoreMap";
import useGeoLocation from "./hooks/useGeoLocation";
import useLocationStore from "./store/useLocationStore";
import ScrollTop from "./components/공용/ScrollTop";
import reset from "./css/reset.css"
import css from './css/style.scss'
import LoginPage from './login/LoginPage';
import SignUpPage from './login/SignUpPage';
import LeisureList from './components/공용/4.list/LeisureList';
import Mypage from './components/menu/Mypage';

function App() {
  // 앱이 처음 시작하면 위치 값 불러오기
  const location = useGeoLocation();
  const setLocation = useLocationStore((state) => state.setLocation);

  useEffect(() => {
    if (location.loaded && location.coordinates) {
      setLocation(location.coordinates);
    }
  }, [location, setLocation]);

  return (
    
      <div className="wrap">
        <ScrollTop />
        <Routes>
          <Route path="/leisure" element={<LeisureList/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/storeMap" element={<StoreMap/>} />
          <Route path="/" element={<Main />} />
          <Route path="/store" element={<Popular_spot />} />
          <Route path="/cuisine" element={<Store />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/Myfavorites" element={<MyFavorites />} />
          <Route path="/mypage" element={<Mypage />} />
        </Routes>
      </div>
 
  );
}

export default App;