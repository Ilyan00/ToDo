import express, { Request, Response } from "express";
import supabase from "./supabaseClient.js";
import path from "path";
import { hashPassword } from "./hash.js";
import { fileURLToPath } from "url";
import { User } from "@supabase/supabase-js";

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
        id: authData.user?.id,
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
      return;
    }
    res.json({
      success: true,
      message: "Inscription réussie",
      data: { email, password },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
});

app.get("/task", async (req: Request, res: Response) => {
  const { data: userLogged, error: authError } = await supabase.auth.getUser();
  if (authError || !userLogged) {
    res.status(400).json({
      success: false,
      message: "Aucun utilisateur connecté",
    });
    return;
  }
  const { data, error } = await supabase
    // Récupération des tâches de l'utilisateur connecté
    .from("tache")
    .select("*")
    .eq("user", userLogged.user.id);
  if (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la récupération des tâches",
    });
    return;
  }
  res.json({
    success: true,
    message: "Tâches récupérées",
    data: data,
  });
});

app.post("/add_task", async (req: Request, res: Response) => {
  const { data: userLogged, error: authError } = await supabase.auth.getUser();
  if (authError || !userLogged) {
    res.status(400).json({
      success: false,
      message: "Aucun utilisateur connecté",
    });
    return;
  }
  const { title, description, deadline } = req.body;

  if (!title || !description || !deadline) {
    res.status(400).json({
      success: false,
      message: "Veuillez remplir tous les champs.",
    });
    return;
  }
  const id = userLogged.user.id;

  const { data: taskData, error: dbError } = await supabase
    .from("tache")
    .insert({
      title: title,
      description: description,
      status: false,
      deadline: new Date(deadline),
      user: id,
    });

  if (dbError) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de l'ajout de la tâche dans la base de données",
      error: dbError.message,
    });
    return;
  }
  res.json({
    success: true,
    message: "Tâche ajoutée avec succès",
    data: taskData,
  });
});

// Route pour mettre à jour une tâche
app.put("/update_task", async (req: Request, res: Response) => {
  const { id, title, description, deadline } = req.body;

  if (!title || !description || !deadline) {
    res.status(400).json({
      success: false,
      message: "Veuillez fournir au moins un champ à mettre à jour.",
    });
    return;
  }

  const updatedData: any = {};
  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (deadline) updatedData.deadline = new Date(deadline);

  try {
    const { data: existingData, error: fetchError } = await supabase
      .from("tache")
      .select("id")
      .eq("id", "b30e877c-8653-41fb-95f5-8f2229a28953")
      .single();

    if (!existingData) {
      res.status(404).json({
        success: false,
        message: "Aucune tâche trouvée avec cet ID.",
      });
      return;
    }

    const { data, error } = await supabase
      .from("tache")
      .update(updatedData)
      .eq("id", id)
      .select();

    if (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de la tâche.",
        error: error.message,
      });
      return;
    }
    res.json({
      success: true,
      message: "Tâche mise à jour avec succès.",
      data: data,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur.",
      error: error.message,
    });
    return;
  }
});

// Servir une page de connexion
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../", "login.html"));
});

app.get("/dashboard", (req: Request, res: Response) => {
  res.send("<h1>Bienvenue sur le tableau de bord !</h1>");
});
app.get("/form_task_add", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../", "form_task_add.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
