import express, { Request, Response } from "express";
import supabase from "./supabaseClient.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour gérer les formulaires
app.use(express.static(__dirname));

// Middleware pour analyser les corps JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir une page de connexion
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../", "login.html"));
});

// Route pour gérer la connexion
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Veuillez remplir tous les champs.",
    });
    return;
  }

  // Authentification avec Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(400).json({
      success: false,
      message: "Mauvais mot de passe ou email.",
    });
  } else {
    res.json({
      success: true,
      message: "Connexion réussie",
      data: { email, password },
    });
  }
});

// Route pour la page protégée
app.get("/dashboard", (req: Request, res: Response) => {
  res.send("<h1>Bienvenue sur le tableau de bord !</h1>");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
