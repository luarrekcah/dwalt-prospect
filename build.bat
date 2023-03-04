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

IF EXIST linux-builds (
    color 0C
    echo Removendo a pasta linux-builds...
    color 07
    rd /s /q linux-builds
)

IF EXIST .wwebjs_auth (
    color 0C
    echo Removendo a pasta .wwebjs_auth...
    color 07
    rd /s /q .wwebjs_auth
)


color 0A
echo Selecione uma opção:
color 07
echo 1 - Buildar para Windows
echo 2 - Buildar para Linux
echo 3 - Buildar para todos
choice /c 123 /n /m "Digite o número da opção desejada: "
set opcao=%errorlevel%

IF %opcao%==1 (
    color 0A
    echo Compilando o aplicativo Prospect para Windows...
    color 07
    electron-packager . --icon=src/assets/icon.ico && node build
) ELSE IF %opcao%==2 (
    color 0A
    echo Compilando o aplicativo Prospect para Linux...
    color 07
    electron-packager . --overwrite --platform=linux --arch=x64 --icon=src/assets/icon.png --prune=true --out=linux-builds
) ELSE IF %opcao%==3 (
    color 0A
    echo Compilando o aplicativo Prospect para todas as plataformas...
    color 07
    electron-packager . --icon=src/assets/icon.ico && node build
    electron-packager . --overwrite --platform=linux --arch=x64 --icon=src/assets/icon.png --prune=true --out=linux-builds
) ELSE (
    color 0C
    echo Opção inválida!
)


color 0A
echo Compilação concluída com sucesso!
color 07
