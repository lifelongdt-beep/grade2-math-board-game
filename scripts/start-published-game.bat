@echo off
setlocal
set "ROOT=%~dp0"
set "LAUNCHER=%ROOT%published-internet-launcher.ps1"
set "POWERSHELL=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

cd /d "%ROOT%"

if not exist "%LAUNCHER%" (
  echo published-internet-launcher.ps1 was not found.
  pause
  exit /b 1
)

if not exist "%POWERSHELL%" (
  set "POWERSHELL=powershell"
)

echo.
echo Starting Grade 2 Math Board Game...
echo Keep this window open during class.
echo.
"%POWERSHELL%" -NoProfile -ExecutionPolicy Bypass -File "%LAUNCHER%"
echo.
echo Finished. If an error is shown above, send a screenshot of this window.
pause
endlocal
