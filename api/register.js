import bcrypt from "bcryptjs";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_USERS = "Users";
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_USERS_URL; // mesmo Apps Script

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();

    if (!username || !password) return res.status(400).json({ error: "Missing username or password" });

    // 1. Buscar usuários existentes
    const getUsers = await fetch(`${APPS_SCRIPT_URL}?sheet=${SHEET_USERS}`);
    const usersData = await getUsers.json();
    const existingUser = usersData.find(u => u.username === username);
    if (existingUser) return res.status(400).json({ error: "Username already exists" });

    // 2. Criar hash da senha
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // 3. Salvar no Google Sheets via Apps Script POST
    const payload = { action: "addUser", username, passwordHash: hash, createdAt: new Date().toISOString() };
    const save = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const saveResult = await save.json();
    res.status(200).json({ success: true, user: username, details: saveResult });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
