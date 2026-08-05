@echo off
setlocal
set "ROOT=%~dp0"
set "SERVER_SCRIPT=%ROOT%published-server.ps1"
set "PORT=5173"

cd /d "%ROOT%"

if not exist "%SERVER_SCRIPT%" (
  echo published-server.ps1 was not found.
  pause
  exit /b 1
)

for %%P in (5173 5174 5175 5176 5177 5178 5179 5180) do (
  powershell -NoProfile -Command "exit ([int](Get-NetTCPConnection -LocalPort %%P -State Listen -ErrorAction SilentlyContinue | Measure-Object).Count)"
  if errorlevel 1 (
    rem Port is already in use.
  ) else (
    set "PORT=%%P"
    goto :PORT_FOUND
  )
)

:PORT_FOUND

set "LAN_IP=127.0.0.1"
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$ip=(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null } | ForEach-Object { $_.IPv4Address | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress } | Select-Object -First 1); if ($ip) { $ip } else { '127.0.0.1' }"`) do set "LAN_IP=%%I"
powershell -NoProfile -Command "[System.IO.File]::WriteAllText((Join-Path $env:ROOT 'mobile-origin.json'), ('{""origin"":""http://' + $env:LAN_IP + ':' + $env:PORT + '""}'), [System.Text.UTF8Encoding]::new($false))"

echo.
echo Starting Grade 2 Math Board Game in local Wi-Fi mode...
echo Keep this window open during class.
echo.
echo Local URL: http://127.0.0.1:%PORT%/
echo Classroom URL: http://%LAN_IP%:%PORT%/
echo Mobile URL: http://%LAN_IP%:%PORT%/?m=1
echo.

start "?????? ???" powershell -NoProfile -ExecutionPolicy Bypass -NoExit -File "%SERVER_SCRIPT%" -Port %PORT%

set "SERVER_READY=0"
for /l %%I in (1,1,10) do (
  powershell -NoProfile -Command "try { $r=Invoke-WebRequest -Uri 'http://127.0.0.1:%PORT%/' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 (
    set "SERVER_READY=1"
    goto :SERVER_OK
  )
  timeout /t 1 >nul
)

:SERVER_OK

if "%SERVER_READY%"=="1" (
  start "" "http://127.0.0.1:%PORT%/"
) else (
  echo.
  echo The server did not start.
  echo Check the opened server window for errors.
  pause
)
endlocal
