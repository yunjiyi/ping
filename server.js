import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

app.get("/ping", (req, res) => {
  const referer = req.headers.referer || "";
  const allowedReferer = process.env.ALLOWED_REFERER || "";

  if (!referer.includes(allowedReferer)) {
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
