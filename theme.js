// ─── THÈME SAISONNIER ─────────────────────────
// Chargé dans le <head> (sans defer) pour appliquer le thème avant l'affichage.
// Halloween : actif en octobre seulement (heure de Montréal).
// Aperçu hors saison : ajouter ?theme=halloween à l'URL.
(() => {
  const month = new Intl.DateTimeFormat('en-CA', { month: 'numeric', timeZone: 'America/Toronto' }).format(new Date())
  const forced = new URLSearchParams(location.search).get('theme') === 'halloween'
  if (month !== '10' && !forced) return

  document.documentElement.classList.add('theme-halloween')
  const font = document.createElement('link')
  font.rel = 'stylesheet'
  font.href = 'https://fonts.googleapis.com/css2?family=Creepster&display=swap'
  document.head.appendChild(font)
})()
