import React from "react";
import { Link } from "react-router-dom";
import css from "../../../css/popular_spot.scss"

function Popular_spot_list({ storeName, storeThumbnail, storeDistance, storeData }) {
  return (
    <div className="popular-store-card">
      <Link to="/products" state={{ store: storeData, categoryType: "restaurant" }}>
        <div className="img_wrap">
          {storeThumbnail ? (
            <img
              src={storeThumbnail}
              alt={storeName}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23eee'/%3E%3Ctext x='50%' y='50%' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23666'%3E이미지 없음%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <div className="no_image">이미지 없음</div>
          )}
        </div>
        <div className="info">
          <p className="title">{storeName}</p>
          {storeDistance && <p className="distance">{storeDistance}</p>}
        </div>
      </Link>
    </div>
  );
}

export default Popular_spot_list;
