
export const API_URL = "http://localhost:3000/api/utilisateurs";

export async function inscrire(utilisateur: any) {
  const response = await fetch(`${API_URL}/inscrire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(utilisateur),
  });
  if (!response.ok) throw new Error("Erreur lors de l'inscription");
  return response.json();
}

export async function connexion(credentials: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/connexion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Identifiants invalides");
  return response.json();
}
