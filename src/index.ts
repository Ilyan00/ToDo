import express, { Request, Response } from "express";
import supabase from "./supabaseClient.js";
import path from "path";
import { hashPassword } from "./hash.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "../src")));
// Route pour gérer la connexion
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // S'il manque des informations
    res.status(400).json({
      success: false,
      message: "Veuillez remplir tous les champs.",
    });
    return;
  }

  // Vérification des informations
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

// Route pour ajouter un user
app.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // S'il manque des informations
    res.status(400).json({
      success: false,
      message: "Veuillez remplir tous les champs.",
    });
    return;
  }
  try {
    // Ajout d'un utilisateur
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

    // Ajout à la base de données
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

// Route pour recuperer les tâches d'un user
app.get("/task", async (req: Request, res: Response) => {
  // Vérification de l'utilisateur connecté
  const { data: userLogged, error: authError } = await supabase.auth.getUser();
  if (authError || !userLogged) {
    res.status(400).json({
      success: false,
      message: "Aucun utilisateur connecté",
    });
    return;
  }

  // Récupération des tâches de l'utilisateur connecté
  const { data, error } = await supabase
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

// Route pour publier une tâche
app.post("/add_task", async (req: Request, res: Response) => {
  // Vérification de l'utilisateur connecté
  const { data: userLogged, error: authError } = await supabase.auth.getUser();
  if (authError || !userLogged) {
    res.status(400).json({
      success: false,
      message: "Aucun utilisateur connecté",
    });
    return;
  }

  const { title, description, deadline } = req.body;
  // S'il manque des informations
  if (!title || !description || !deadline) {
    res.status(400).json({
      success: false,
      message: "Veuillez remplir tous les champs.",
    });
    return;
  }

  // Ajout de la tâche à la base de données
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
  // Vérification de l'utilisateur connecté
  const { data: userLogged, error: authError } = await supabase.auth.getUser();
  if (authError || !userLogged) {
    res.status(400).json({
      success: false,
      message: "Aucun utilisateur connecté",
    });
    return;
  }

  // S'il manque des informations
  const { id, title, description, deadline } = req.body;
  if (!title || !description || !deadline) {
    res.status(400).json({
      success: false,
      message: "Veuillez fournir au moins un champ à mettre à jour.",
    });
    return;
  }

  // Modification des informations
  const updatedData: any = {};
  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (deadline) updatedData.deadline = new Date(deadline);

  try {
    const { data: existingData, error: fetchError } = await supabase
      .from("tache")
      .select("id")
      .eq("id", id)
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

// Route pour supprimer une tâche
app.delete("/delete_task", async (req: Request, res: Response) => {
  // Vérification de l'utilisateur connecté
  const { data: userLogged, error: authError } = await supabase.auth.getUser();
  if (authError || !userLogged) {
    res.status(400).json({
      success: false,
      message: "Aucun utilisateur connecté",
    });
    return;
  }
  try {
    // S'il manque des informations
    const { id } = req.body;
    if (!id) {
      res.status(400).json({
        success: false,
        message: "Veuillez fournir l'ID de la tâche à supprimer.",
      });
      return;
    }

    // Suppression de la tâche de la base de données
    const { data: existingData, error: fetchError } = await supabase
      .from("tache")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingData) {
      res.status(404).json({
        success: false,
        message: "Aucune tâche trouvée avec cet ID.",
      });
      return;
    }

    if (existingData.user != userLogged.user.id) {
      res.status(403).json({
        success: false,
        message:
          "Vous ne pouvez pas supprimer une tâche qui ne vous appartient pas.",
      });
      return;
    }
    const { data: deleteData, error: deleteError } = await supabase
      .from("tache")
      .delete()
      .eq("id", id);

    if (deleteError) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de la tâche.",
        error: deleteError.message,
      });
      return;
    }

    res.json({
      success: true,
      message: "Tâche supprimée avec succès.",
      data: deleteData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur.",
      error: error.message,
    });
    return;
  }
});

// Route pour changer le statut d'une tâche
app.put("/status_task", async (req: Request, res: Response) => {
  // Vérification de l'utilisateur connecté
  const { data: userLogged, error: authError } = await supabase.auth.getUser();
  if (authError || !userLogged) {
    res.status(400).json({
      success: false,
      message: "Aucun utilisateur connecté",
    });
    return;
  }

  // S'il manque des informations
  const { id, status } = req.body;
  if (!id || typeof status !== "boolean") {
    res.status(400).json({
      success: false,
      message: "Veuillez fournir un ID de tâche et un état valide.",
    });
    return;
  }

  try {
    // Vérification que la tache existe
    const { data: existingData, error: fetchError } = await supabase
      .from("tache")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingData) {
      res.status(404).json({
        success: false,
        message: "Aucune tâche trouvée avec cet ID.",
      });
      return;
    }

    // Modification du status
    const { data, error } = await supabase
      .from("tache")
      .update({ status: status })
      .eq("id", id)
      .select();

    if (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du status.",
        error: error.message,
      });
      return;
    }
    res.json({
      success: true,
      message: "Mise à jour du status de la tache faite avec succès.",
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

// Afficher la page de connexion et d'inscription
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../", "login.html"));
});

// Afficher la page des ToDo
app.get("/todo", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../", "todo.html"));
});

// Lancer le serv
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
