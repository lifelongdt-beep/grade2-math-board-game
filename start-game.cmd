@echo off
setlocal
set "ROOT=%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 20 or later and pnpm 9, then run this file again.
  pause
  exit /b 1
)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm was not found. Install pnpm 9 before running the game.
  pause
  exit /b 1
)

cd /d "%ROOT%"

if not exist "node_modules" (
  echo Installing app dependencies...
  call pnpm install --frozen-lockfile
  if errorlevel 1 exit /b 1
)

set "LAN_IP=127.0.0.1"
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$ip=(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null } | ForEach-Object { $_.IPv4Address | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress } | Select-Object -First 1); if ($ip) { $ip } else { '127.0.0.1' }"`) do set "LAN_IP=%%I"
if not exist "%ROOT%public" mkdir "%ROOT%public"
powershell -NoProfile -Command "[System.IO.File]::WriteAllText((Join-Path $env:ROOT 'public\mobile-origin.json'), ('{""origin"":""http://' + $env:LAN_IP + ':5173""}'), [System.Text.UTF8Encoding]::new($false))"

start "" node "%ROOT%node_modules\vite\bin\vite.js" --host 0.0.0.0 --port 5173
timeout /t 2 >nul
echo Classroom URL: http://%LAN_IP%:5173/
echo Mobile URL: http://%LAN_IP%:5173/?m=1
start "" "http://%LAN_IP%:5173/"
endlocal
