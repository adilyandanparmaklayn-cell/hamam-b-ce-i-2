
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";

const PORT = process.env.PORT || 3000;
const USERNAME = process.env.TIKTOK_USERNAME || "sakinadilmuhammed";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hamam Böceği Düğünü çalışıyor!");
});

const wss = new WebSocketServer({ server });

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(message);
  });
}

wss.on("connection", socket => {
  socket.send(JSON.stringify({
    type: "status",
    message: "Oyuna bağlandın!"
  }));
});

const connection = new TikTokLiveConnection(USERNAME);

connection.on(WebcastEvent.CHAT, data => {
  broadcast({
    type: "chat",
    username: data.user?.uniqueId || "izleyici",
    comment: data.comment || ""
  });
});

connection.on(WebcastEvent.GIFT, data => {
  broadcast({
    type: "gift",
    username: data.user?.uniqueId || "izleyici",
    giftName: data.giftName || "Hediye"
  });
});

connection.on(WebcastEvent.LIKE, data => {
  broadcast({
    type: "like",
    username: data.user?.uniqueId || "izleyici",
    count: data.likeCount || 1
  });
});

connection.connect()
  .then(() => console.log("TikTok bağlantısı kuruldu."))
  .catch(error => console.error("TikTok bağlantı hatası:", error));

server.listen(PORT, () => {
  console.log("Sunucu çalışıyor:", PORT);
});
    
