const bcrypt = require("bcryptjs");
const { get, run } = require("./database");

async function registerUser(username, password) {
  const cleanUsername = username.trim();
  if (!cleanUsername || !password) {
    throw new Error("Username and password are required.");
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    await run("INSERT INTO users (username, password) VALUES (?, ?)", [cleanUsername, hashed]);
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE")) {
      throw new Error("That username already exists.");
    }
    throw error;
  }
}

async function loginUser(username, password) {
  const cleanUsername = username.trim();
  const user = await get("SELECT password FROM users WHERE username = ?", [cleanUsername]);
  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password.toString());
}

module.exports = {
  registerUser,
  loginUser
};
