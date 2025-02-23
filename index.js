// index.js
const express = require("express");
const fetch = require("node-fetch"); // หากใช้ Node.js เวอร์ชัน 18+ สามารถใช้ global fetch ได้
const app = express();
const PORT = process.env.PORT || 3000;

// รองรับ JSON body
app.use(express.json());

// ตั้งค่า CORS headers ให้อนุญาตเฉพาะโดเมนของคุณ
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://bujersey.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Endpoint proxy สำหรับส่งคำขอไปยัง Google Apps Script
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
    // กำหนด options สำหรับ fetch
    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" }
    };

    if (req.method === "POST") {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.text(); // รับข้อมูลเป็น text แล้วส่งกลับไปยัง client
    res.send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Error fetching from Google Apps Script" });
  }
});

// เริ่ม server
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});