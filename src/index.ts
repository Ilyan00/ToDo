import express, { Request, Response } from "express";
import supabase from "./supabaseClient.js";
import path from "path";
import { hashPassword } from "./hash.js";
import { fileURLToPath } from "url";
import { AuthError } from "@supabase/supabase-js";

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

app.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Veuillez remplir tous les champs.",
    });
    return;
  }
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      res.status(400).json({
        success: false,
        message: "Erreur lors de l'inscription.",
        error: authError.message,
      });
      return;
    }
    const pwd = await hashPassword(password);
    const { data: userData, error: dbError } = await supabase
      .from("user")
      .insert({
        email: email,
        password: pwd,
      });

    if (dbError) {
      res.status(400).json({
        success: false,
        message:
          "Erreur lors de l'ajout de l'utilisateur dans la base de données",
        error: dbError.message,
      });
      console.log(dbError);
      return;
    }
    res.json({
      success: true,
      message: "Inscription réussie",
      data: { email, password },
    });
  } catch (err) {
    console.error("Erreur inattendue:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur.",
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
