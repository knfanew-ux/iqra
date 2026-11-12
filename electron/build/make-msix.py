"""Fabrique le paquet Microsoft Store (MSIX, x64) d'Iqra sous Linux, avec openappx.

Usage :
  python3 build/make-msix.py --name <Nom du paquet> --publisher "CN=..." \
      [--publisher-name "Sensei Dev"] [--display-name Iqra] [--out dist/Iqra-1.7.5.msix]

--name et --publisher se lisent dans Partner Center, page « Identité du produit » de l'application
(Package/Identity/Name et Package/Identity/Publisher). La version vient de package.json (x.y.z.0).
Le Store signe lui-même le paquet : il n'a pas besoin de certificat.
"""
import argparse, json, pathlib, shutil, subprocess, sys
from xml.sax.saxutils import escape

ROOT = pathlib.Path(__file__).resolve().parent.parent
p = argparse.ArgumentParser()
p.add_argument('--name', required=True)
p.add_argument('--publisher', required=True)
p.add_argument('--publisher-name', default='Sensei Dev')
p.add_argument('--display-name', default='Iqra')
p.add_argument('--app', default=str(ROOT / 'dist' / 'win-unpacked'))
p.add_argument('--assets', default=str(ROOT / 'build' / 'store-assets'))
p.add_argument('--out')
a = p.parse_args()

version = json.loads((ROOT / 'package.json').read_text())['version'] + '.0'
out = pathlib.Path(a.out or ROOT / 'dist' / f'Iqra-{version[:-2]}.msix')
layout = ROOT / 'dist' / 'msix-layout'
shutil.rmtree(layout, ignore_errors=True)
shutil.copytree(a.app, layout)
shutil.copytree(a.assets, layout / 'Assets')

manifest = f"""<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
         xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
         IgnorableNamespaces="uap rescap">
  <Identity Name="{escape(a.name)}" Publisher="{escape(a.publisher)}" Version="{version}" ProcessorArchitecture="x64"/>
  <Properties>
    <DisplayName>{escape(a.display_name)}</DisplayName>
    <PublisherDisplayName>{escape(a.publisher_name)}</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
    <Description>Apprendre à lire le Coran, à prier et à invoquer, avec la bonne prononciation.</Description>
  </Properties>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.26100.0"/>
  </Dependencies>
  <Resources>
    <Resource Language="fr-FR"/>
  </Resources>
  <Applications>
    <Application Id="Iqra" Executable="Iqra.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="{escape(a.display_name)}" Description="Apprendre à lire le Coran"
          BackgroundColor="transparent" Square150x150Logo="Assets\\Square150x150Logo.png" Square44x44Logo="Assets\\Square44x44Logo.png">
        <uap:DefaultTile Wide310x150Logo="Assets\\Wide310x150Logo.png" Square71x71Logo="Assets\\SmallTile.png" Square310x310Logo="Assets\\LargeTile.png"/>
      </uap:VisualElements>
    </Application>
  </Applications>
  <Capabilities>
    <Capability Name="internetClient"/>
    <rescap:Capability Name="runFullTrust"/>
    <DeviceCapability Name="microphone"/>
  </Capabilities>
</Package>
"""
(layout / 'AppxManifest.xml').write_text(manifest, encoding='utf-8')
subprocess.run(['openappx', 'validate', '--root', str(layout)], check=True)
out.unlink(missing_ok=True)
subprocess.run(['openappx', 'pack', '--root', str(layout), '--out', str(out)], check=True)
print('paquet :', out, out.stat().st_size, 'octets')
