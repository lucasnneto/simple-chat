const { BD } = require("./bd");

class Chats {
  constructor() {}
  async createChat(name, user) {
    const chats = await BD.getData();
    if (chats[name]) return { msg: "Chat já existe" };
    chats[name] = {
      history: [],
      users: [user],
    };
    await BD.setData(chats);
    return { msg: "Chat criado!" };
  }
  async getChat(name) {
    const chats = await BD.getData();
    if (!chats[name]) return { msg: "Chat não encontrado" };
    return { name, ...chats[name] };
  }
  async getAllChat() {
    const chats = await BD.getData();
    console.log(chats);
    const mappedChats = Object.keys(chats).map((name) => ({
      name,
      users: chats[name].users.length,
    }));
    return mappedChats;
  }
  async enterChat(name, user) {
    const chats = await BD.getData();
    if (!chats[name]) return { msg: "Chat não encontrado" };
    if (chats[name].users.includes(user))
      return { msg: "Voce já esta no chat" };
    chats[name].users.push(user);
    await BD.setData(chats);
    return { name, ...chats[name] };
  }
  async textChat(name, user, msg) {
    const chats = await BD.getData();
    if (!chats[name]) return { msg: "Chat não encontrado" };
    if (!chats[name].users.includes(user))
      return { msg: "É necessario entrar no chat primeiro" };
    const date = new Date();
    chats[name].history.push({
      user,
      msg,
      date: date.toISOString(),
    });
    await BD.setData(chats);
    return { name, ...chats[name] };
  }
}
exports.chats = new Chats();
