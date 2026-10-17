/* One catalogue shared by the immersive shop and Next.js product pages. */
window.maisonCatalogueReady = fetch('/prototype/collection-config.json').then(response => {
  if (!response.ok) throw new Error('Catalogue indisponible');
  return response.json();
}).then(config => { window.MAISON = config; return config; });
