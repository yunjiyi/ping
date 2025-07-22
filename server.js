import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// 🌐 CORS 允许两个指定域名访问
const allowedOrigins = ["https://toolxp.com", "https://cti.pp.ua"];

app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
});

// 🛡️ Referer 验证（允许两个来源页面）
app.get("/ping", (req, res) => {
  const referer = req.headers.referer || "";
  const allowedReferers = ["toolxp.com", "cti.pp.ua"];
  const isValid = allowedReferers.some(r => referer.includes(r));

  if (!isValid) {
    return res.status(403).send("Forbidden");
  }

  const ip =
    req.headers["x-forwarded-for"] ||
    req.headers["cf-connecting-ip"] ||
    req.socket.remoteAddress;

  res.json({
    timestamp: new Date().toISOString(),
    ip,
    location: process.env.POP_ALIAS || "Unknown",
    region: process.env.POP_LABEL || "Unknown"
  });
});

app.listen(port, () => {
  console.log(`Ping API running on port ${port}`);
});
