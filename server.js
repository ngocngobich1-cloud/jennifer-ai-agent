const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "jennifer_verify_token";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  console.log("Tin nhắn mới:");
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});