# Enveloppe Windows d'Iqra (Electron)

Ce dossier contient de quoi fabriquer les installateurs Windows à partir du code web
(branche `iqra-web` de knfanew-ux/essalam-ivoirelire), copié dans `src/`.

- `main.js` : fenêtre de l'application, autorisation du micro seule, liens externes
  dans le navigateur, et recherche de mise à jour au démarrage (puis toutes les 24 h)
  sur la dernière publication GitHub de knfanew-ux/iqra.
- `package.json` : version et réglages electron-builder.
- `build/installer.nsi`, `build/installer32.nsi` : installateurs NSIS 64 et 32 bits.
- `build/seticon.mjs`, `build/seticon32.mjs` : icône et métadonnées de l'exécutable (resedit).

La procédure complète est décrite dans le dossier technique d'Iqra.
