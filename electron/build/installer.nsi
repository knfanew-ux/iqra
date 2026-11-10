; Installateur Windows — Iqra, apprendre à lire le Coran
Unicode true
SetCompressor /SOLID lzma
RequestExecutionLevel user

!define APPNAME "Iqra"
!define APPLONG "Iqra - Apprendre le Coran"
!define VERSION "1.7.1"
!define REGKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\IqraCoran"

Name "${APPNAME} — Apprendre à lire le Coran"
OutFile "..\dist\Iqra-Setup-${VERSION}.exe"
InstallDir "$LOCALAPPDATA\Programs\Iqra"
InstallDirRegKey HKCU "Software\IqraCoran" "InstallDir"
BrandingText "Iqra ${VERSION}"

VIProductVersion "1.7.1.0"
VIAddVersionKey /LANG=1036 "ProductName" "Iqra"
VIAddVersionKey /LANG=1036 "FileDescription" "Installation de Iqra — Apprendre à lire le Coran"
VIAddVersionKey /LANG=1036 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=1036 "ProductVersion" "${VERSION}"
VIAddVersionKey /LANG=1036 "LegalCopyright" "Sensei Dev"

!include "MUI2.nsh"
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Bienvenue dans l'installation de Iqra"
!define MUI_WELCOMEPAGE_TEXT "Iqra vous aide à apprendre à lire le Coran avec la bonne prononciation : alphabet, voyelles, règles de tajwîd, lecture des sourates avec un récitant, mot par mot.$\r$\n$\r$\nUne connexion Internet est nécessaire pour l'audio.$\r$\n$\r$\nCliquez sur Suivant pour continuer."
!define MUI_FINISHPAGE_RUN "$INSTDIR\Iqra.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Lancer Iqra"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "French"

Section "Iqra" SecMain
  SetOutPath "$INSTDIR"
  ; Fermer l'application si elle est ouverte (mise à jour)
  nsExec::Exec 'taskkill /F /IM Iqra.exe'
  File /r "..\dist\win-unpacked\*.*"
  File "icon.ico"

  WriteUninstaller "$INSTDIR\Desinstaller Iqra.exe"
  CreateShortcut "$DESKTOP\${APPLONG}.lnk" "$INSTDIR\Iqra.exe" "" "$INSTDIR\icon.ico"
  CreateShortcut "$SMPROGRAMS\${APPLONG}.lnk" "$INSTDIR\Iqra.exe" "" "$INSTDIR\icon.ico"

  WriteRegStr HKCU "Software\IqraCoran" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${REGKEY}" "DisplayName" "Iqra — Apprendre à lire le Coran"
  WriteRegStr HKCU "${REGKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${REGKEY}" "Publisher" "Sensei Dev"
  WriteRegStr HKCU "${REGKEY}" "DisplayIcon" "$INSTDIR\icon.ico"
  WriteRegStr HKCU "${REGKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${REGKEY}" "UninstallString" '"$INSTDIR\Desinstaller Iqra.exe"'
  WriteRegDWORD HKCU "${REGKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${REGKEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  nsExec::Exec 'taskkill /F /IM Iqra.exe'
  Delete "$DESKTOP\${APPLONG}.lnk"
  Delete "$SMPROGRAMS\${APPLONG}.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${REGKEY}"
  DeleteRegKey HKCU "Software\IqraCoran"
SectionEnd
