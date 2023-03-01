@echo off

color 0A
echo Bem-vindo ao script de compilação Prospect!
color 07
echo Procurando por arquivos e pastas desnecessários...

IF EXIST dist (
    color 0C
    echo Removendo a pasta dist...
    color 07
    rd /s /q dist
)

IF EXIST license.key (
    color 0C
    echo Removendo o arquivo license.key...
    color 07
    del /f /q license.key
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

IF EXIST .wwebjs_auth (
    color 0C
    echo Removendo a pasta .wwebjs_auth...
    color 07
    rd /s /q .wwebjs_auth
)

color 0A
echo Compilando o aplicativo Prospect...
color 07
npm run package

color 0A
echo Compilação concluída com sucesso!
color 07
