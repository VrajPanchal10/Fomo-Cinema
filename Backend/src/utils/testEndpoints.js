const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

const testAll = async () => {
  console.log("Starting API Endpoints Audit...\n");

  // 1. Authenticate
  let token = "";
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@fomocinema.com", password: "adminpassword123" }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error("Login Failed:", loginData);
      process.exit(1);
    }
    token = loginData.token;
    console.log("✓ Admin login successful.");
    console.log("Token role:", loginData.user.role);
  } catch (err) {
    console.error("Login request failed:", err.message);
    process.exit(1);
  }

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const endpoints = [
    { name: "Admin Stats", url: "/admin/stats", method: "GET" },
    { name: "Admin Users", url: "/admin/users", method: "GET" },
    { name: "Admin Bookings", url: "/admin/bookings", method: "GET" },
    { name: "Admin Movies", url: "/admin/movies", method: "GET" },
    { name: "Admin Shows", url: "/admin/shows", method: "GET" },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep.url}`, {
        method: ep.method,
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✓ ${ep.name} Succeeded (${res.status})`);
      } else {
        console.error(`✗ ${ep.name} Failed (${res.status}):`, data);
      }
    } catch (err) {
      console.error(`✗ ${ep.name} Failed with error:`, err.message);
    }
  }

  process.exit(0);
};

testAll();
