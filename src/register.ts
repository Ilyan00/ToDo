namespace register {
  // fonction pour ajouter une task quand le formulaire est submit
  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const formDataObject = Object.fromEntries(data.entries());

    try {
      // Appelle de l'inscription
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });
      if (response) {
        const result = await response.json();

        if (result.success) {
          // Redirection vers la page d'ajout de tâche
          window.location.href = "/todo";
        } else {
          // Sinon on affiche le message d'erreur
          const message_error = document.getElementById("error-connexion");
          if (message_error) {
            message_error.innerHTML = "Erreur de connexion : " + result.message;
          }
        }
      } else {
        alert("Une erreur est survenue lors de la connexion.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      alert("Impossible de se connecter au serveur.");
    }
  };

  const form = document.querySelector<HTMLFormElement>(".form-register");
  form?.addEventListener("submit", handleSubmit);
}
