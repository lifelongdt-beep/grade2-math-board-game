param(
  [int]$StartPort = 5173
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ToolDir = Join-Path $Root '_tools'
$Cloudflared = Join-Path $ToolDir 'cloudflared.exe'
$TunnelOut = Join-Path $Root 'internet-tunnel-out.log'
$TunnelErr = Join-Path $Root 'internet-tunnel-err.log'
$RunLog = Join-Path $Root 'internet-run.log'
$ServerLog = Join-Path $Root 'internet-server.log'
$transcriptStarted = $false
$serverJob = $null
$tunnelProcess = $null

try {
  $Host.UI.RawUI.WindowTitle = 'Grade 2 Math Board Game'
} catch {
}

try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {
}

function Write-Step {
  param([string]$Message)
  Write-Host ''
  Write-Host $Message -ForegroundColor Cyan
}

function Test-PortAvailable {
  param([int]$Port)

  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($listener) {
      $listener.Stop()
    }
  }
}

function Get-FreePort {
  param([int]$FirstPort)

  for ($port = $FirstPort; $port -le ($FirstPort + 30); $port++) {
    if (Test-PortAvailable $port) {
      return $port
    }
  }

  throw "No free port found near $FirstPort."
}

function Get-LanIpAddress {
  try {
    $ip = Get-NetIPConfiguration |
      Where-Object { $_.IPv4DefaultGateway -ne $null } |
      ForEach-Object {
        $_.IPv4Address |
          Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
          Select-Object -First 1 -ExpandProperty IPAddress
      } |
      Select-Object -First 1

    if ($ip) {
      return $ip
    }
  } catch {
  }

  return '127.0.0.1'
}

function Write-MobileOrigin {
  param([string]$Origin)

  $json = '{"origin":"' + $Origin + '"}'
  [System.IO.File]::WriteAllText((Join-Path $Root 'mobile-origin.json'), $json, [System.Text.UTF8Encoding]::new($false))
}

function Start-StaticServerJob {
  param(
    [string]$RootPath,
    [int]$Port,
    [string]$LogPath
  )

  $serverBlock = {
    param(
      [string]$RootPath,
      [int]$Port,
      [string]$LogPath
    )

    $ErrorActionPreference = 'Stop'
    $MimeTypes = @{
      '.css' = 'text/css; charset=utf-8'
      '.html' = 'text/html; charset=utf-8'
      '.js' = 'text/javascript; charset=utf-8'
      '.json' = 'application/json; charset=utf-8'
      '.png' = 'image/png'
      '.svg' = 'image/svg+xml'
      '.webp' = 'image/webp'
    }

    function Add-ServerLog {
      param([string]$Message)
      try {
        Add-Content -LiteralPath $LogPath -Value "[$([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))] $Message" -Encoding ASCII
      } catch {
      }
    }

    function Get-SafeFilePath {
      param(
        [string]$RequestPath,
        [string]$RootPath
      )

      $pathOnly = ($RequestPath -split '\?')[0]
      if ([string]::IsNullOrWhiteSpace($pathOnly) -or $pathOnly -eq '/') {
        $pathOnly = '/index.html'
      }

      $decoded = [System.Uri]::UnescapeDataString($pathOnly).TrimStart('/')
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $RootPath $decoded))
      $rootFull = [System.IO.Path]::GetFullPath($RootPath)

      if (-not $candidate.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        return (Join-Path $RootPath 'index.html')
      }

      if ([System.IO.File]::Exists($candidate)) {
        return $candidate
      }

      return (Join-Path $RootPath 'index.html')
    }

    function Write-HttpResponse {
      param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [string]$ContentType,
        [byte[]]$Body
      )

      $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
      $Stream.Write($headerBytes, 0, $headerBytes.Length)
      $Stream.Write($Body, 0, $Body.Length)
    }

    $listener = $null
    try {
      $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
      $listener.Start()
      Add-ServerLog "SERVER_READY http://127.0.0.1:$Port/"
      Write-Output "SERVER_READY"

      while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $null

        try {
          $stream = $client.GetStream()
          $buffer = New-Object byte[] 8192
          $read = $stream.Read($buffer, 0, $buffer.Length)

          if ($read -le 0) {
            continue
          }

          $requestText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)
          $requestLine = ($requestText -split "`r?`n")[0]
          $parts = $requestLine -split ' '
          $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
          $filePath = Get-SafeFilePath $requestPath $RootPath
          $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
          $contentType = if ($MimeTypes.ContainsKey($extension)) { $MimeTypes[$extension] } else { 'application/octet-stream' }
          $body = [System.IO.File]::ReadAllBytes($filePath)

          Write-HttpResponse $stream 200 'OK' $contentType $body
        } catch {
          Add-ServerLog "Request error: $($_.Exception.Message)"
          try {
            $message = [System.Text.Encoding]::UTF8.GetBytes('Server error')
            if ($stream) {
              Write-HttpResponse $stream 500 'Internal Server Error' 'text/plain; charset=utf-8' $message
            }
          } catch {
          }
        } finally {
          if ($client) {
            $client.Close()
          }
        }
      }
    } catch {
      Add-ServerLog "SERVER_ERROR $($_.Exception.Message)"
      throw
    } finally {
      if ($listener) {
        $listener.Stop()
      }
    }
  }

  return Start-Job -ScriptBlock $serverBlock -ArgumentList $RootPath, $Port, $LogPath
}

function Get-JobDetails {
  param([System.Management.Automation.Job]$Job)

  if (-not $Job) {
    return ''
  }

  try {
    $text = Receive-Job -Job $Job -Keep -ErrorAction SilentlyContinue | Out-String
  } catch {
    $text = ''
  }

  try {
    $err = $Job.ChildJobs | ForEach-Object { $_.Error | Out-String }
    if ($err) {
      $text = "$text`n$err"
    }
  } catch {
  }

  return $text.Trim()
}

function Wait-LocalServer {
  param(
    [int]$Port,
    [System.Management.Automation.Job]$Job
  )

  for ($attempt = 1; $attempt -le 40; $attempt++) {
    if ($Job.State -in @('Failed', 'Stopped', 'Completed')) {
      $details = Get-JobDetails $Job
      throw "Local server stopped early. $details"
    }

    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 1
      if ($response.StatusCode -eq 200) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  $details = Get-JobDetails $Job
  throw "Local server did not respond. $details"
}

function Read-TunnelLogs {
  param([string[]]$LogPaths)

  $items = @()
  foreach ($path in $LogPaths) {
    if (Test-Path -LiteralPath $path) {
      $text = Get-Content -Raw -LiteralPath $path -ErrorAction SilentlyContinue
      if (-not [string]::IsNullOrWhiteSpace($text)) {
        $items += $text.Trim()
      }
    }
  }

  return ($items -join "`n")
}

function Wait-TunnelUrl {
  param(
    [string[]]$LogPaths,
    [System.Diagnostics.Process]$Process
  )

  $pattern = 'https://(?!api\.)[-a-zA-Z0-9]+\.trycloudflare\.com\b'

  for ($attempt = 1; $attempt -le 25; $attempt++) {
    foreach ($path in $LogPaths) {
      if (-not (Test-Path -LiteralPath $path)) {
        continue
      }

      $text = Get-Content -Raw -LiteralPath $path -ErrorAction SilentlyContinue
      if ([string]::IsNullOrWhiteSpace($text)) {
        continue
      }

      $match = [regex]::Match($text, $pattern)
      if ($match.Success) {
        return $match.Value.TrimEnd('/')
      }
    }

    if ($Process -and $Process.HasExited) {
      $logs = Read-TunnelLogs $LogPaths
      if ([string]::IsNullOrWhiteSpace($logs)) {
        $logs = 'No extra log output.'
      }
      throw "Cloudflare tunnel stopped early.`n$logs"
    }

    Start-Sleep -Seconds 1
  }

  $logs = Read-TunnelLogs $LogPaths
  throw "Timed out while creating an internet URL.`n$logs"
}

function Open-Url {
  param([string]$Url)

  try {
    Start-Process $Url
  } catch {
    Write-Host "Open this URL manually: $Url" -ForegroundColor Yellow
  }
}

function Test-Cloudflared {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return $false
  }

  try {
    $output = & $Path --version 2>&1
    if ($LASTEXITCODE -eq 0 -and ($output | Out-String) -match 'cloudflared') {
      return $true
    }
  } catch {
  }

  return $false
}

function Ensure-Cloudflared {
  param([string]$Path)

  if (Test-Cloudflared $Path) {
    return $true
  }

  if (Test-Path -LiteralPath $Path) {
    Write-Host 'Existing internet access tool is broken. Deleting it and downloading again.' -ForegroundColor Yellow
    Remove-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
  }

  Write-Step 'Downloading internet access tool. This only happens the first time.'
  Write-Host 'The teacher screen is already open. Please wait for the download to finish.'
  $downloadUrl = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'

  try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $Path -UseBasicParsing -TimeoutSec 240
  } catch {
    Write-Host ''
    Write-Host 'Download failed. The teacher screen can still be used on this computer.' -ForegroundColor Red
    Write-Host 'For mobile access, try start-local.cmd on the same Wi-Fi, or try this launcher on a less restricted network.' -ForegroundColor Yellow
    Write-Host "Download URL: $downloadUrl"
    Write-Host $_.Exception.Message
    return $false
  }

  if (-not (Test-Cloudflared $Path)) {
    Write-Host ''
    Write-Host 'Downloaded internet access tool could not run on this computer.' -ForegroundColor Red
    Write-Host 'The teacher screen can still be used on this computer.'
    return $false
  }

  return $true
}

function Wait-To-Close {
  param([string]$Message)

  Write-Host ''
  Read-Host $Message
}

try {
  if (-not (Test-Path -LiteralPath (Join-Path $Root 'index.html'))) {
    throw 'index.html was not found. Unzip the package first, then run start-game.cmd inside the unzipped folder.'
  }

  New-Item -ItemType Directory -Path $ToolDir -Force | Out-Null
  Remove-Item -LiteralPath $TunnelOut, $TunnelErr, $RunLog, $ServerLog -ErrorAction SilentlyContinue

  try {
    Start-Transcript -Path $RunLog -Force | Out-Null
    $transcriptStarted = $true
  } catch {
    $transcriptStarted = $false
  }

  Write-Host 'Grade 2 Math Board Game' -ForegroundColor Green
  Write-Host 'Keep this window open during class.'
  Write-Host 'The game server runs inside this launcher.'
  Write-Host 'A local teacher screen will open first.'
  Write-Host 'Then this launcher will try to create a public internet URL.'
  Write-Host 'Run log: internet-run.log'

  $port = Get-FreePort $StartPort
  $localTeacherUrl = "http://127.0.0.1:$port/"
  $lanIp = Get-LanIpAddress
  $sameWifiOrigin = if ($lanIp -eq '127.0.0.1') { '' } else { "http://$($lanIp):$port" }
  Write-MobileOrigin $sameWifiOrigin

  Write-Step "Starting local game server on port $port..."
  $serverJob = Start-StaticServerJob $Root $port $ServerLog
  Wait-LocalServer $port $serverJob

  Write-Step 'Opening the teacher screen now...'
  Write-Host "Teacher screen: $localTeacherUrl" -ForegroundColor Yellow
  if ($sameWifiOrigin) {
    Write-Host "Same Wi-Fi mobile QR is ready now: $sameWifiOrigin/?m=1" -ForegroundColor Yellow
  }
  Open-Url $localTeacherUrl

  if ($env:MATHGAME_SKIP_TUNNEL -eq '1') {
    Write-Host 'Skipping public internet URL because MATHGAME_SKIP_TUNNEL=1.'
    Wait-To-Close 'Press Enter to stop the local server'
    return
  }

  if (-not (Ensure-Cloudflared $Cloudflared)) {
    Wait-To-Close 'Press Enter to stop the local server'
    return
  }

  $publicOrigin = $null
  $lastTunnelError = $null

  for ($attempt = 1; $attempt -le 1; $attempt++) {
    Remove-Item -LiteralPath $TunnelOut, $TunnelErr -ErrorAction SilentlyContinue
    Write-Step "Creating public internet URL ($attempt/3)..."
    try {
      $tunnelProcess = Start-Process -FilePath $Cloudflared -ArgumentList "tunnel --url http://127.0.0.1:$port --no-autoupdate" -WorkingDirectory $Root -RedirectStandardOutput $TunnelOut -RedirectStandardError $TunnelErr -WindowStyle Hidden -PassThru
    } catch {
      $lastTunnelError = $_.Exception.Message
      Write-Host 'Could not start the internet access tool.' -ForegroundColor Yellow
      if ($attempt -lt 3) {
        Start-Sleep -Seconds 2
        continue
      }
      break
    }

    try {
      $publicOrigin = Wait-TunnelUrl @($TunnelOut, $TunnelErr) $tunnelProcess
      break
    } catch {
      $lastTunnelError = $_.Exception.Message
      if ($tunnelProcess -and -not $tunnelProcess.HasExited) {
        Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
      }
      $tunnelProcess = $null
      if ($attempt -lt 3) {
        Write-Host 'Public URL was not ready. Retrying...' -ForegroundColor Yellow
        Start-Sleep -Seconds 2
      }
    }
  }

  if (-not $publicOrigin) {
    Write-Host ''
    Write-Host 'Could not create a public internet URL.' -ForegroundColor Red
    Write-Host 'The teacher screen is still open on this computer.' -ForegroundColor Yellow
    Write-Host 'If your network blocks Cloudflare Tunnel, use start-local.cmd on the same Wi-Fi.' -ForegroundColor Yellow
    Write-Host ''
    Write-Host $lastTunnelError
    Wait-To-Close 'Press Enter to stop the local server'
    return
  }

  Write-MobileOrigin $publicOrigin

  $teacherUrl = "$publicOrigin/"
  $studentUrl = "$publicOrigin/?m=1"

  Write-Host ''
  Write-Host 'Public internet URL is ready.' -ForegroundColor Green
  Write-Host "Teacher internet screen: $teacherUrl" -ForegroundColor Yellow
  Write-Host "Student mobile screen:  $studentUrl" -ForegroundColor Yellow
  Write-Host ''
  Write-Host 'The internet teacher screen will open now.'
  Write-Host 'Use the QR code from the internet teacher screen for student phones.'
  Open-Url $teacherUrl

  Wait-To-Close 'Press Enter after class to stop the server'
} catch {
  Write-Host ''
  Write-Host 'Launcher failed.' -ForegroundColor Red
  Write-Host $_.Exception.Message
  Write-Host ''
  Write-Host 'Try start-game.bat. If it still fails, send a screenshot of this window and internet-run.log.'
  Wait-To-Close 'Press Enter to close'
} finally {
  if ($tunnelProcess -and -not $tunnelProcess.HasExited) {
    Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
  }

  if ($serverJob) {
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -Force -ErrorAction SilentlyContinue
  }

  if ($transcriptStarted) {
    try {
      Stop-Transcript | Out-Null
    } catch {
    }
  }
}
