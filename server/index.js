require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

// FastAPI 서버 주소
const PY_API_BASE = "https://place-crawling.onrender.com";

app.use(cors());
app.use(express.json());

// 서버 상태 확인
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "서버 실행" });
});

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// 식당 검색
app.get("/api/restaurants", async (req, res) => {
  try {
    const { lat, lng, category_group, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat, lng는 필수입니다." });
    }

    const params = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: radius ? parseInt(radius) : 5000,
    };

    if (category_group) params.category_group = category_group; // 문자열 그대로 전달

    const response = await axios.get(`${PY_API_BASE}/restaurants`, { params });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /restaurants error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch from FastAPI /restaurants",
      details: error.response?.data || error.message,
    });
  }
});

// 식당 상세
app.get("/api/restaurant/:place_id", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/restaurant/${req.params.place_id}`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /restaurant/:place_id error:", error.response?.data || error.message);
    res.status(500).json({
      error: "식당 상세 정보를 불러오는 데 실패했습니다.",
      details: error.response?.data || error.message,
    });
  }
});


// 영업시간
app.get("/api/restaurant/:business_id/hours", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/restaurant/${req.params.business_id}/hours`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /restaurant/:business_id/hours error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch from FastAPI /restaurant/:business_id/hours",
      details: error.response?.data || error.message,
    });
  }
});

// 메뉴 가져오기
app.get("/api/menu", async (req, res) => {
  if (!req.query.business_id) {
    return res.status(400).json({ error: "Missing business_id parameter" });
  }

  try {
    const response = await axios.get(`${PY_API_BASE}/menu`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /menu error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch from FastAPI /menu",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`- server 실행 -> http://localhost:${PORT}`);
  console.log(`- FastAPI 주소 -> ${PY_API_BASE}`);
});
