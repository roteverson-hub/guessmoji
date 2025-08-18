export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
      }

      // Envia para o Apps Script UsersWebApp
      const response = await fetch(process.env.APPS_SCRIPT_USERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username,
          password, // texto puro para teste
          createdAt: new Date().toISOString()
        }),
      });

      const data = await response.json();
      return res.status(200).json(data);

    } catch (error) {
      return res.status(500).json({ error: "Error registering user", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
