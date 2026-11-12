# Enveloppe Windows d'Iqra (Electron)

Ce dossier contient de quoi fabriquer les installateurs Windows à partir du code web
(branche `iqra-web` de knfanew-ux/essalam-ivoirelire), copié dans `src/`.

- `main.js` : fenêtre de l'application, autorisation du micro seule, liens externes
  dans le navigateur, et recherche de mise à jour au démarrage (puis toutes les 24 h)
  sur la dernière publication GitHub de knfanew-ux/iqra.
- `package.json` : version et réglages electron-builder.
- `build/installer.nsi`, `build/installer32.nsi` : installateurs NSIS 64 et 32 bits.
- `build/seticon.mjs`, `build/seticon32.mjs` : icône et métadonnées de l'exécutable (resedit),
  numéro de version lu dans `package.json`.
- `build/fuses.mjs` : désactive les fonctions d'Electron inutiles à Iqra (lancement comme Node.js,
  options Node, débogueur) ; à lancer sur chaque `Iqra.exe` après `seticon`, avant NSIS.

Depuis la 1.7.5, la fenêtre ne peut plus quitter l'application : seules les adresses https
s'ouvrent, dans le navigateur ; tout autre protocole est ignoré.

La procédure complète est décrite dans le dossier technique d'Iqra.
