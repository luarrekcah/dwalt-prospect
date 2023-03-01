@echo off

color 0A
echo Bem-vindo ao script de compilação Prospect!
color 07
echo Procurando por arquivos e pastas desnecessários...

IF EXIST license.json (
    color 0C
    echo Removendo o arquivo license.json...
    color 07
    del /f /q license.json
)

IF EXIST Prospect-installers (
    color 0C
    echo Removendo a pasta Prospect-installers...
    color 07
    rd /s /q Prospect-installers
)

IF EXIST Prospect-win32-x64 (
    color 0C
    echo Removendo a pasta Prospect-win32-x64...
    color 07
    rd /s /q Prospect-win32-x64
)

color 0A
echo Compilando o aplicativo Prospect...
color 07
electron-packager . --icon=src/assets/icon.ico && node build

color 0A
echo Compilação concluída com sucesso!
color 07
