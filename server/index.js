require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

// Python FastAPI 서버 주소 (.env 에 넣어두는 게 좋음)
const PY_API_BASE = process.env.PY_API_BASE || "https://arcane-dynamics-470515-j8.du.r.appspot.com";

// ---------------------------
// CORS 설정
// ---------------------------
app.use(cors({
  origin: "http://localhost:3000",  // React 앱 주소
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));
app.use(express.json());

// ---------------------------
// 서버 상태 확인
// ---------------------------
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "서버 실행" });
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

// ---------------------------
// Restaurant API
// ---------------------------
// ✅ 식당 검색 (/restaurants)
app.get("/api/restaurants", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/restaurants`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /restaurants error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ✅ 식당 상세 (/restaurant/:place_id)
app.get("/api/restaurant/:place_id", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/restaurant/${req.params.place_id}`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /restaurant/:place_id error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ✅ 식당 영업시간 (/restaurant/:business_id/hours)
app.get("/api/restaurant/:business_id/hours", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/restaurant/${req.params.business_id}/hours`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /restaurant/:business_id/hours error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ---------------------------
// Activity API
// ---------------------------
// ✅ 여가시설 검색 (/activities)
app.get("/api/activities", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/activities`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /activities error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ✅ 여가시설 상세 (/activity/:place_id)
app.get("/api/activity/:place_id", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/activity/${req.params.place_id}`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /activity/:place_id error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ✅ 여가 영업시간 (/activity/:business_id/hours)
app.get("/api/activity/:business_id/hours", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/activity/${req.params.business_id}/hours`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /activity/:business_id/hours error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ---------------------------
// Menu API
// ---------------------------
// ✅ 메뉴 가져오기 (/menu?business_id=...)
app.get("/api/menu", async (req, res) => {
  if (!req.query.business_id) return res.status(400).json({ error: "Missing business_id parameter" });
  try {
    const response = await axios.get(`${PY_API_BASE}/menu`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /menu error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.get("/api/menu/menu", async (req, res) => {
  const place_id = req.query.place_id;
  if (!place_id) {
    // place_id가 없으면 빈 배열 반환
    return res.json({ menu: [] });
  }

  try {
    const response = await axios.get(`${PY_API_BASE}/menu/menu`, { params: { place_id } });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /menu/menu error:", error.response?.data || error.message);
    // FastAPI에서 에러가 나도 빈 배열 반환
    res.json({ menu: [] });
  }
});

app.get("/api/menu/menuGroups", async (req, res) => {
  const place_id = req.query.place_id;
  if (!place_id) {
    // place_id가 없으면 빈 배열 반환
    return res.json({ menuGroups: [] });
  }

  try {
    const response = await axios.get(`${PY_API_BASE}/menu/menuGroups`, { params: { place_id } });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /menu/menuGroups error:", error.response?.data || error.message);
    // FastAPI에서 에러가 나도 빈 배열 반환
    res.json({ menuGroups: [] });
  }
});

// ---------------------------
// Cache API
// ---------------------------
// ✅ 메뉴 캐싱 (/cache/menu)
app.get("/api/cache/menu", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/cache/menu`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /cache/menu error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ---------------------------
// Category API
// ---------------------------
// ✅ 음식 카테고리 가져오기
app.get("/api/category/restaurant", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/category/restaurant`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /category/restaurant error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ✅ 액티비티 카테고리 가져오기
app.get("/api/category/activity", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/category/activity`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /category/activity error:", error.response?.data || error.message);
    // 기본 카테고리 반환
    res.json([
      { category_group: "게임,멀티미디어" },
      { category_group: "공방" },
      { category_group: "도서,교육" },
      { category_group: "문화,예술" },
      { category_group: "방탈출카페" },
      { category_group: "사진,스튜디오" },
      { category_group: "스포츠,오락" },
      { category_group: "여행,관광" }
    ]);
  }
});

// ---------------------------
// Auth API
// ---------------------------
// UUID 체크 함수
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ✅ 게스트 유저 생성
app.get("/api/auth/guest", async (req, res) => {
  try {
    const response = await axios.get(`${PY_API_BASE}/auth/guest`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /auth/guest error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ✅ 회원가입
app.post("/api/auth/signup", async (req, res) => {
  try {
    const requestBody = { ...req.body };
    if (!requestBody.guest_id || !isValidUUID(requestBody.guest_id)) {
      requestBody.guest_id = null;
    }
    const response = await axios.post(`${PY_API_BASE}/auth/signup`, requestBody);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /auth/signup error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ✅ 로그인
app.post("/api/auth/login", async (req, res) => {
  try {
    const response = await axios.post(`${PY_API_BASE}/auth/login`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("❌ /auth/login error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ---------------------------
// Action API
// ---------------------------
// ✅ 식당 액션 기록 (view, click, like, dislike)
app.post("/api/action/restaurant", async (req, res) => {
  try {
    const { user_id, place_id, action_type } = req.query;
    if (!user_id || !place_id || !action_type) {
      return res.status(400).json({ error: "user_id, place_id, action_type required" });
    }
    const response = await axios.post(`${PY_API_BASE}/action/restaurant`, null, { params: { user_id, place_id, action_type } });
    res.json(response.data);
  } catch (error) {
    console.error("❌ /action/restaurant error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// ---------------------------
// Action API
// ---------------------------
app.post("/api/action/activity", async (req, res) => {
  try {
    // query에서 가져오기
    const { user_id, place_id, action_type } = req.query;

    if (!user_id || !place_id || !action_type) {
      return res.status(400).json({
        error: "Missing required parameters",
        details: "user_id, place_id, and action_type are required"
      });
    }

    // FastAPI로 query 파라미터로 전달
    const response = await axios.post(`${PY_API_BASE}/action/activity`, null, {
      params: { user_id, place_id, action_type }
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ /action/activity error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to record activity action",
      details: error.response?.data || error.message,
    });
  }
});



// ---------------------------
// 서버 시작
// ---------------------------
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`FastAPI base URL: ${PY_API_BASE}`);
});
