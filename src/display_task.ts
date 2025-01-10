namespace add_task {
  const getTasks = async () => {
    try {
      const response = await fetch("/task", {
        method: "GET",
      });

      if (!response.ok) {
        console.error(
          `Erreur lors de la récupération des tâches : ${response.statusText}`
        );
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (erreur) {
      console.error("Erreur lors de la requête :", erreur);
      return [];
    }
  };

  const displayTasks = async () => {
    console.log("Chargement des tâches...");
    const tasks = await getTasks();

    if (!tasks || tasks.length === 0) {
      console.log("Aucune tâche trouvée.");
      return;
    }

    const container = document.getElementById("tasks-container");
    if (container) {
      container.innerHTML = "";
      tasks.forEach((task) => {
        console.log(task.title);
        container.innerHTML += `<p>${task.title}</p>`;
      });
    } else {
      console.error("Conteneur introuvable dans le DOM.");
    }
  };

  displayTasks();
}
