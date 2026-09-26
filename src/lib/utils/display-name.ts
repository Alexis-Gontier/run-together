type NamedUser = {
  username?: string | null
  displayUsername?: string | null
  name?: string | null
}

/** Nom affiché d'un membre partout dans l'app : le username, le nom en dernier recours. */
export function displayName(user: NamedUser): string {
  return user.displayUsername || user.username || user.name || "Inconnu"
}
