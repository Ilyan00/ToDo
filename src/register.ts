namespace register {
  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const formDataObject = Object.fromEntries(data.entries());

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });
      if (response) {
        const result = await response.json();
        console.log("Réponse du serveur :", result);

        if (result.success) {
          window.location.href = "./form_task_add";
        } else {
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
