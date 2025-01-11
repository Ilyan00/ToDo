# Todo List avec TypeScript et Supabase

Ce projet est une application de gestion de tâches (Todo List) développée en **TypeScript**, avec **Supabase** comme backend pour la gestion des données.

## Développeurs
- **Yohan Seneret**
- **Ilyan-Jude Bain-Trimbach**

---

## Prérequis
- **Node.js** (version 14 ou supérieure)
- **npm** ou **yarn**
- Un compte **Supabase**
- **pg_restore** (inclus avec PostgreSQL) pour restaurer la base de données.

---

## Installation et Lancement

### 1. Cloner le dépôt

### 2. Installer les dépendances
npm install

### 3. Configurer les variables d'environnement
- Créez un fichier `.env` à la racine du projet.
- Ajoutez les informations suivantes :
  SUPABASE_URL=<url_de_votre_instance_supabase>
  SUPABASE_KEY=<clé_du_projet_supabase>

### 4. Construire les fichiers TypeScript
npm run build

### 5. Configurer la base de données
1. Créez une nouvelle base de données dans Supabase.
2. Restaurez la base de données avec la commande suivante (remplacez `<PASSWORD>` et `<HOST>` par vos informations) :
   pg_restore -d postgresql://postgres:<PASSWORD>@<HOST>:5432/postgres -v db

### 6. Lancer le projet
npm run dev

---

## Technologies Utilisées
- **TypeScript** : pour un développement robuste et typé.
- **Supabase** : pour le backend et la persistance des données.
