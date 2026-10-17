/* Pixel-identical offline bake of the original deterministic stone generator.
   Original: artifacts/loading/entrance-textures-source.js. No runtime noise loop. */
(function(){let cached;window.createEntranceStone=function(T){if(cached)return cached;
 const maps={color:new T.Texture(),roughness:new T.Texture(),normal:new T.Texture()};
 const ready=Promise.all(Object.keys(maps).map(name=>window.loadMaisonTexture(T,'/prototype/assets/entrance/stone-'+name+'.webp',name==='color').then(source=>{
   maps[name].copy(source);maps[name].wrapS=maps[name].wrapT=T.ClampToEdgeWrapping;maps[name].anisotropy=8;maps[name].needsUpdate=true;
 })));cached={...maps,ready};return cached;};})();
