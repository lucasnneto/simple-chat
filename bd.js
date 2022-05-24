const fs = require("fs").promises;
class BD {
  name = "";
  constructor(name = "chats") {
    this.name = name;
  }
  async getData() {
    const file = await fs.readFile(this.name + ".json");
    return JSON.parse(file.toString() || "{}");
  }
  async setData(data) {
    await fs.writeFile(this.name + ".json", JSON.stringify(data));
  }
}
exports.BD = new BD();
