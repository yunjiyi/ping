import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import http from "http";
import { WebSocketServer } from "ws";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// 🌐 CORS 中间件（适用于所有请求）
const allowedOrigins = ["https://toolxp.com", "https://cti.pp.ua"];
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
});

// 🚧 限速中间件（仅用于 /ping 路径）
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
});

// 🛡️ /ping 路由：校验 Referer + 限速
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

// ⛑️ /health 接口（可供 Nginx 检测服务是否存活）
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 🚀 启动 HTTP 服务
const server = http.createServer(app);

// 🔗 WebSocket 接口：监听 /ws 路径
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    if (message.toString() === "ping") {
      ws.send(`pong:${Date.now()}`);
    }
  });
});

// 🧭 启动监听
server.listen(port, () => {
  console.log(`Ping + WS API running on port ${port}`);
});
