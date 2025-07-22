import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// 🌐 CORS 限制：仅允许两个域名访问
const allowedOrigins = ["https://toolxp.com", "https://cti.pp.ua"];
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
});

// 🚧 IP限速中间件：每分钟最多请求10次
const limiter = rateLimit({
  windowMs: 60 * 1000, // 每分钟
  max: 10,             // 每 IP 最多10次请求
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/ping", limiter); // 只作用于 /ping 路由

// 🛡️ Referer校验：仅允许两个页面来源
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
