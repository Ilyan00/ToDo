namespace task {
  // fonction pour modifier une tache
  const update_task = (taskElement: HTMLElement) => {
    const paragraphs = taskElement.querySelectorAll("p.editable, h2.editable");

    paragraphs.forEach((p) => {
      // Modification des textes en input
      const currentValue = p.textContent || "";
      const input = document.createElement("input");
      if (p.classList.contains("date")) {
        input.type = "date";
        input.value = currentValue;
      } else {
        input.type = "text";
        input.value = currentValue;
      }
      p.classList.forEach((cls: any) => input.classList.add(cls));
      input.classList.remove("editable");
      p.replaceWith(input);

      input.addEventListener("blur", async (event) => {
        const input_title: any = taskElement.querySelector(".title");
        const input_description: any =
          taskElement.querySelector(".description");
        const input_deadline: any = taskElement.querySelector(".date");

        const taskId = taskElement.dataset.taskId;

        const updatedTask = {
          id: taskId,
          title: input_title?.value,
          description: input_description?.value,
          deadline: input_deadline?.value,
        };

        // Appelle de la modification avec les nouvelle valeurs
        const response = await fetch(`/update_task`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        });

        if (response) {
          const result = await response.json();

          if (result.success) {
            // Rétablir les inputs en paragraphes
            taskElement.querySelectorAll("input").forEach((input) => {
              if (input.type !== "checkbox") {
                const p = document.createElement("p");
                p.classList.add("editable", ...input.classList);
                p.textContent = input.value;
                input.replaceWith(p);
              }
            });
          } else {
            // Sinon on affiche l'erreur
            const message_error = document.getElementById("error-task");
            if (message_error) {
              message_error.innerHTML =
                "Erreur de la modification de la tache : " + result.message;
            }
          }
        } else {
          const message_error = document.getElementById("error-task");
          if (message_error) {
            message_error.innerHTML =
              "Une erreur est survenue lors de la connexion.";
          }
        }
      });
    });
  };

  // fonction pour supprimer une tache
  const delete_task = async (taskElement: HTMLElement) => {
    const taskId = taskElement.dataset.taskId;

    // Appelle de la suppression
    const response = await fetch(`/delete_task`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: taskId }),
    });
    if (response) {
      // Enleve
      const result = await response.json();

      if (result.success) {
        taskElement.remove();
        const tasks = await getTasks();
        // S'il n'y a plus de tache
        if (tasks.length === 0) {
          const all_task_container = document.querySelector(".all-task");
          if (all_task_container) {
            all_task_container.innerHTML = "Aucune tâche à afficher.";
          }
          return;
        }
      } else {
        // Sinon on affiche l'erreur
        const message_error = document.getElementById("error-task");
        if (message_error) {
          message_error.innerHTML =
            "Erreur de la suppression de la tache : " + result.message;
        }
      }
    } else {
      const message_error = document.getElementById("error-task");
      if (message_error) {
        message_error.innerHTML =
          "Une erreur est survenue lors de la connexion.";
      }
    }
  };

  const change_status = async (
    editButton: HTMLImageElement,
    deleteButton: HTMLImageElement,
    taskElement: HTMLElement,
    statusInput: HTMLInputElement,
    container: HTMLElement,
    container_done: HTMLElement
  ) => {
    // initialisé les btns
    let NeweditButton = editButton;
    let NewdeleteButton = deleteButton;

    // Si les boutons n'existent pas, les créer dynamiquement
    if (!editButton || !deleteButton) {
      NeweditButton = document.createElement("img");
      NeweditButton.classList.add("edit-btn");
      NeweditButton.src = "./assets/img/edit-svgrepo-com (1).svg";
      NeweditButton.alt = "";
      NeweditButton.width = 45;

      NewdeleteButton = document.createElement("img");
      NewdeleteButton.classList.add("delete-btn");
      NewdeleteButton.src = "./assets/img/trash.svg";
      NewdeleteButton.alt = "";
      NewdeleteButton.width = 30;

      NewdeleteButton?.addEventListener("click", () => {
        delete_task(taskElement);
      });

      NeweditButton?.addEventListener("click", () => {
        update_task(taskElement);
      });
    }

    const taskId = taskElement.dataset.taskId;
    const status = statusInput.checked;

    // Appelle de la modification du status
    const response = await fetch(`/status_task`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: taskId, status: status }),
    });

    if (response) {
      const result = await response.json();

      if (result.success) {
        taskElement.remove();

        if (status) {
          // Si la tâche est marquée comme terminée, la déplacer vers le container_done
          container_done.appendChild(taskElement);
          // Supprimer les boutons d'édition et de suppression si présents
          taskElement.querySelector(".edit-btn")?.remove();
          taskElement.querySelector(".delete-btn")?.remove();
        } else {
          // Si la tâche est réactivée, la remettre dans le container et ajouter les boutons
          taskElement.appendChild(NeweditButton);
          taskElement.appendChild(NewdeleteButton);
          container.appendChild(taskElement);
        }
      } else {
        // Sinon on affiche l'erreur
        const message_error = document.getElementById("error-task");
        if (message_error) {
          message_error.innerHTML =
            "Erreur du changement de status de la tache : " + result.message;
        }
      }
    } else {
      const message_error = document.getElementById("error-task");
      if (message_error) {
        message_error.innerHTML =
          "Une erreur est survenue lors de la connexion.";
      }
    }
  };

  // fonction pour recuperer toute les taches du user connecté
  const getTasks = async () => {
    try {
      // Appelle de la récupération des tâches
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
    const tasks = await getTasks();

    const container = document.getElementById("tasks-container");
    const container_done = document.getElementById("tasks-done-container");
    const template = document.getElementsByClassName("task-template")[0];
    console.log(container, container_done);
    if (container && container_done && template) {
      container.innerHTML = `
        <h2>Tâche à réaliser</h2>
        <div class="barre"></div>
      `;

      tasks.forEach((task: any) => {
        // Changement des informations
        const taskCard = template.cloneNode(true) as HTMLElement;
        taskCard.classList.remove("task-template");
        taskCard.classList.add("task");

        taskCard.dataset.taskId = task.id.toString();
        taskCard.style.display = "block";

        const title = taskCard.querySelector(".title") as HTMLElement;
        const description = taskCard.querySelector(
          ".description"
        ) as HTMLElement;
        const deadline = taskCard.querySelector(".date") as HTMLElement;
        const statusInput = taskCard.querySelector(
          ".status-input"
        ) as HTMLInputElement;

        title.textContent = task.title;
        description.textContent = task.description;
        deadline.textContent = task.deadline;
        statusInput.checked = task.status;

        // Ajout des taches dans le container correspondant
        if (!task.status) {
          container.appendChild(taskCard);
        } else {
          taskCard.querySelector(".edit-btn")?.remove();
          taskCard.querySelector(".delete-btn")?.remove();
          container_done.appendChild(taskCard);
        }
      });

      const task_containers = document.querySelectorAll(".task");
      task_containers.forEach((taskElement: any) => {
        const editButton = taskElement.querySelector(".edit-btn");
        const deleteButton = taskElement.querySelector(".delete-btn");
        const statusInput = taskElement.querySelector(".status-input");

        // Ajout des evenements pour chaque task
        statusInput?.addEventListener("change", () => {
          change_status(
            editButton,
            deleteButton,
            taskElement,
            statusInput,
            container,
            container_done
          );
        });

        deleteButton?.addEventListener("click", () => {
          delete_task(taskElement);
        });

        editButton?.addEventListener("click", () => {
          update_task(taskElement);
        });
      });
    } else {
      console.error("Conteneur introuvable dans le DOM.");
    }
  };

  displayTasks();
}
