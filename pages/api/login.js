export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { email, password } = req.body;

  // ✅ Simple fake auth (for demo)
  if (email === "admin@test.com" && password === "1234") {
    return res.status(200).json({
      token: "demo-token-123"
    });
  }

  res.status(401).json({ error: "Invalid credentials" });
}