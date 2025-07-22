import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// 🌐 CORS 中间件：应最先运行，确保所有响应都带跨域头
const allowedOrigins = ["https://toolxp.com", "https://cti.pp.ua"];
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
});

// 🚧 限速中间件：应用于 /ping 路由，但在 CORS之后
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// 🛡️ 路由定义：Referer校验 + 速率限制
app.get("/ping", limiter, (req, res) => {
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
