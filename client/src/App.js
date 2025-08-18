import logo from "./logo.svg";
import "./App.css";
import reset from "./css/reset.css";
import Header from "./components/공용/1.header/Header";
import Footer from "./components/공용/3.footer/Footer";
import List from "./components/공용/4.list/List";
import css from "./css/style.scss";
import { BrowserRouter as Router, Routes, Route, LInk, BrowserRouter } from "react-router-dom";
import Main from "./components/Main";
import Popular_spot from "./components/popular/Popular_spot";
import Popular_spot_list from "./components/공용/4.list/Popular_spot_list";
import ScrollTop from "./components/공용/ScrollTop";
import Cafe from "./components/menu/Store";
import Store from "./components/menu/Store";
import useGeoLocation from "./hooks/useGeoLocation";
import useLocationStore from "./store/useLocationStore";
import { useEffect } from "react";
import StoreMap from "./components/menu/StoreMap";
import Budget from "./components/budget/Budget";
import ProductList from "./components/공용/4.list/ProductLIst";
import MyFavorites from "./components/menu/Myfavorites";
function App() {
  // 앱이 처음 시작하면 위치 값 불러오기
  const location = useGeoLocation();
  const setLocation = useLocationStore((state) => state.setLocation);

  useEffect(() => {
    if (location.loaded && location.coordinates) {
      setLocation(location.coordinates);
    }
  }, [location]);

  return (
    <div className="wrap">
      <ScrollTop />
      <Routes>
        <Route path="/storeMap" element={<StoreMap/>} />
        <Route path="/" element={<Main />} />
        <Route path="/store" element={<Popular_spot />} />
        <Route path="/cuisine" element={<Store />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/Myfavorites" element={<MyFavorites />} />
      </Routes>
    </div>
  );
}

export default App;
