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
    const tasks = await getTasks();

    if (!tasks || tasks.length === 0) {
      console.log("Aucune tâche trouvée.");
      return;
    }

    const container = document.getElementById("tasks-container");
    if (container) {
      container.innerHTML = "";
      tasks.forEach((task: any) => {
        container.innerHTML += `
          <div class="task" data-task-id="${task.id}">
            <p class="editable title">${task.title}</p>
            <p class="editable description">${task.description}</p>
            <p class="editable date">${task.deadline}</p>
            <button class="edit-btn">Modifier les tâches</button>
          </div>
        `;
      });

      const task_containers = document.querySelectorAll(".task");
      task_containers.forEach((taskElement: any) => {
        const editButton = taskElement.querySelector(".edit-btn");
        editButton?.addEventListener("click", () => {
          const paragraphs = taskElement.querySelectorAll("p.editable");
          paragraphs.forEach((p: HTMLElement) => {
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
                  alert("Modification prit en compte");
                } else {
                  alert(
                    `Une erreur est survenue lors de la modification, ${result.message}`
                  );
                }
              } else {
                alert("Une erreur est survenue lors de la connexion.");
              }
            });
          });
        });
      });
    } else {
      console.error("Conteneur introuvable dans le DOM.");
    }
  };

  displayTasks();
}
