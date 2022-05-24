const { WebSocketServer } = require("ws");
const express = require("express");
const http = require("http");
const { chats } = require("./chats");

const app = express();
const server = http.createServer(app);

const TYPES = Object.freeze({
  CREATE_USER: "CREATE_USER",
  CREATE: "CREATE",
  LIST: "LIST",
  LIST_ALL: "LIST_ALL",
  ENTER: "ENTER",
  TEXT: "TEXT",
});

app.get("/", (req, res) => res.send(new Date()));

const wss = new WebSocketServer({ server });
function sendToAll(msg, list = []) {
  wss.clients.forEach((ws) => {
    if (list.length) {
      if (list.includes(ws.name)) ws.send(msg);
    } else {
      ws.send(msg);
    }
  });
}
function sendToAllChats(list = []) {
  wss.clients.forEach(async (ws) => {
    const res = await chats.getAllChat(ws.name);
    if (list.length) {
      if (list.includes(ws.name)) ws.send(JSON.stringify(res));
    } else {
      ws.send(JSON.stringify(res));
    }
  });
}
wss.on("connection", function connection(ws) {
  ws.send(JSON.stringify({ status: "Conectado" }));
  ws.on("close", () => {
    console.log("closed", ws.name);
  });
  ws.on("message", async function message(rawData) {
    const data = JSON.parse(rawData.toString());
    switch (data.type) {
      case TYPES.CREATE_USER:
        if (ws.name) {
          return ws.send(JSON.stringify({ msg: "Você já tem um usuário" }));
        }
        if (Array.from(wss.clients).find((el) => el.name === data.name)) {
          return ws.send(JSON.stringify({ msg: "Esse usuario ja existe" }));
        }
        ws.name = data.name;
        ws.send(JSON.stringify({ type: "USER_CREATED", name: ws.name }));
        const resListAll3 = await chats.getAllChat(ws.name);
        ws.send(JSON.stringify(resListAll3));
        break;

      case TYPES.LIST:
        if (!ws.name) {
          return ws.send(
            JSON.stringify("É necessario criar um usuario primeiro")
          );
        }
        ws.pause();
        const resList = await chats.getChat(data.name);
        ws.resume();
        ws.send(JSON.stringify(resList));
        break;

      case TYPES.LIST_ALL:
        const resListAll = await chats.getAllChat(ws.name);
        ws.send(JSON.stringify(resListAll));
        break;

      case TYPES.CREATE:
        if (!ws.name) {
          return ws.send(
            JSON.stringify("É necessario criar um usuario primeiro")
          );
        }
        const resCreate = await chats.createChat(data.name, ws.name);

        ws.send(JSON.stringify(resCreate));
        sendToAllChats();
        break;

      case TYPES.ENTER:
        if (!ws.name) {
          return ws.send(
            JSON.stringify("É necessario criar um usuario primeiro")
          );
        }
        ws.pause();
        const resEnter = await chats.enterChat(data.name, ws.name);
        ws.resume();
        ws.send(JSON.stringify(resEnter));
        sendToAllChats();
        sendToAll(JSON.stringify(resEnter), resEnter.users);
        break;

      case TYPES.TEXT:
        if (!ws.name) {
          return ws.send(
            JSON.stringify("É necessario criar um usuario primeiro")
          );
        }
        const resText = await chats.textChat(data.name, ws.name, data.msg);
        sendToAll(JSON.stringify(resText), resText.users);
        break;

      default:
        ws.send(JSON.stringify({ msg: "Metódo não encontrado" }));
        break;
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
