import * as ResEdit from 'resedit';
import fs from 'fs';
const [vA, vB, vC] = JSON.parse(fs.readFileSync('package.json', 'utf8')).version.split('.').map(Number);
const exePath = 'dist/win-unpacked/Iqra.exe';
const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
const res = ResEdit.NtExecutableResource.from(exe);
const ico = ResEdit.Data.IconFile.from(fs.readFileSync('build/icon.ico'));
const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
const gid = groups.length ? groups[0].id : 1, lang = groups.length ? groups[0].lang : 1033;
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, gid, lang, ico.icons.map((i) => i.data));
const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
if (vi) {
  vi.setStringValues({ lang: 1033, codepage: 1200 }, {
    ProductName: 'Iqra', FileDescription: 'Iqra — Apprendre à lire le Coran', CompanyName: "Sensei Dev",
    LegalCopyright: 'Iqra', OriginalFilename: 'Iqra.exe', InternalName: 'Iqra',
  });
  vi.setFileVersion(vA, vB, vC, 0, 1033); vi.setProductVersion(vA, vB, vC, 0, 1033);
  vi.outputToResourceEntries(res.entries);
}
res.outputResource(exe);
fs.writeFileSync(exePath, Buffer.from(exe.generate()));
console.log('icône et métadonnées appliquées, groupe', gid);
