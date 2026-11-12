// Désactive les fonctions d'Electron dont Iqra n'a pas besoin et qui pourraient être détournées :
// lancer Iqra.exe comme un simple Node.js, lui passer des options Node ou un débogueur.
import { flipFuses, FuseVersion, FuseV1Options } from '@electron/fuses';
const exe = process.argv[2];
if (!exe) { console.error('usage : node build/fuses.mjs <chemin de Iqra.exe>'); process.exit(1); }
await flipFuses(exe, {
  version: FuseVersion.V1,
  resetAdHocDarwinSignature: false,
  [FuseV1Options.RunAsNode]: false,
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
  [FuseV1Options.EnableNodeCliInspectArguments]: false,
  [FuseV1Options.EnableCookieEncryption]: true,
  [FuseV1Options.OnlyLoadAppFromAsar]: true,
});
console.log('fusibles appliqués :', exe);
