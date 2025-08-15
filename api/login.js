import bcrypt from "bcryptjs";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_USERS = "Users";
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_USERS_URL;

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
    const user = usersData.find(u => u.username === username);

    if (!user) return res.status(400).json({ error: "Invalid username or password" });

    // 2. Comparar senha
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid username or password" });

    // 3. Retornar sucesso (token ou apenas username por enquanto)
    res.status(200).json({ success: true, username });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
