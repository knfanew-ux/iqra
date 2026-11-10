import * as ResEdit from 'resedit';
import fs from 'fs';
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
  vi.setFileVersion(1, 7, 0, 0, 1033); vi.setProductVersion(1, 7, 0, 0, 1033);
  vi.outputToResourceEntries(res.entries);
}
res.outputResource(exe);
fs.writeFileSync(exePath, Buffer.from(exe.generate()));
console.log('icône et métadonnées appliquées, groupe', gid);
