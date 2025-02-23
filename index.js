// index.js
const express = require("express");
const fetch = require("node-fetch"); // ใช้ node-fetch เวอร์ชัน 2
const app = express();
const PORT = process.env.PORT || 3000;

// รองรับ JSON body
app.use(express.json());

// ตั้งค่า CORS headers เพื่ออนุญาตเฉพาะโดเมนที่ต้องการ
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://bujersey.netlify.app");  // อนุญาตให้เข้าถึงจากโดเมนนี้
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);  // ส่งสถานะ 200 หากเป็นคำขอ OPTIONS
  }
  next();
});

// Endpoint สำหรับ Proxy ที่จะส่งคำขอไปยัง Google Apps Script
app.all("/proxy", async (req, res) => {
  // URL ของ Google Apps Script Web App
  const googleAppsScriptUrl = "https://script.google.com/macros/s/AKfycbxqfsXWmCqjph693Bau-8HB88IqwZkbn166SgcbW_AT5djxcwPDuT6rQGHvLm-vCglc/exec";
  
  // หากเป็น GET request ให้ต่อ query parameters เข้าไป
  let url = googleAppsScriptUrl;
  if (req.method === "GET" && Object.keys(req.query).length) {
    const queryString = new URLSearchParams(req.query).toString();
    url += "?" + queryString;
  }

  try {
    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };

    // หากเป็น POST request ให้เพิ่ม body ลงไป
    if (req.method === "POST") {
      options.body = JSON.stringify(req.body);
    }

    // ส่งคำขอไปยัง Google Apps Script
    const response = await fetch(url, options);
    const data = await response.json();  // แปลงข้อมูลจาก JSON
    res.json(data);  // ส่งข้อมูลกลับไปยัง client
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Error fetching from Google Apps Script" });
  }
});

// เริ่มต้น server
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
 
