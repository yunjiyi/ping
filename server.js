import express from "express";
const app = express();
const port = process.env.PORT || 8080;

app.get("/ping", (req, res) => {
  const referer = req.headers.referer || "";
  if (!referer.includes("yourfrontend.com")) {
    return res.status(403).send("Forbidden");
  }

  res.json({
    timestamp: new Date().toISOString(),
    server: process.env.POP_ALIAS || "Tokyo-VPS",
    region: process.env.POP_LABEL || "Asia",
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress
  });
});

app.listen(port, () => {
  console.log(`Latency probe running on port ${port}`);
});
