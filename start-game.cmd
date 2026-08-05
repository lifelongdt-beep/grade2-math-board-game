@echo off
setlocal
set "ROOT=%~dp0"
set "NODE=C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "PNPM=C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
set "PATH=C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"

if not exist "%NODE%" (
  echo Node runtime was not found.
  pause
  exit /b 1
)

cd /d "%ROOT%"

if not exist "node_modules" (
  echo Installing app dependencies...
  call "%PNPM%" install
)

set "LAN_IP=127.0.0.1"
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$ip=(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null } | ForEach-Object { $_.IPv4Address | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress } | Select-Object -First 1); if ($ip) { $ip } else { '127.0.0.1' }"`) do set "LAN_IP=%%I"
if not exist "%ROOT%public" mkdir "%ROOT%public"
powershell -NoProfile -Command "[System.IO.File]::WriteAllText((Join-Path $env:ROOT 'public\mobile-origin.json'), ('{""origin"":""http://' + $env:LAN_IP + ':5173""}'), [System.Text.UTF8Encoding]::new($false))"

start "" "%NODE%" "%ROOT%node_modules\vite\bin\vite.js" --host 0.0.0.0 --port 5173
timeout /t 2 >nul
echo Classroom URL: http://%LAN_IP%:5173/
echo Mobile URL: http://%LAN_IP%:5173/?m=1
start "" "http://%LAN_IP%:5173/"
endlocal
