param(
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$MimeTypes = @{
  '.css' = 'text/css; charset=utf-8'
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png' = 'image/png'
  '.svg' = 'image/svg+xml'
  '.webp' = 'image/webp'
}

function Get-SafeFilePath {
  param([string]$RequestPath)

  $pathOnly = ($RequestPath -split '\?')[0]
  if ([string]::IsNullOrWhiteSpace($pathOnly) -or $pathOnly -eq '/') {
    $pathOnly = '/index.html'
  }

  $decoded = [System.Uri]::UnescapeDataString($pathOnly).TrimStart('/')
  $candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $decoded))
  $rootFull = [System.IO.Path]::GetFullPath($Root)

  if (-not $candidate.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    return (Join-Path $Root 'index.html')
  }

  if ([System.IO.File]::Exists($candidate)) {
    return $candidate
  }

  return (Join-Path $Root 'index.html')
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

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$listener.Start()
Write-Host "Published game server running at http://localhost:$Port/"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $buffer = New-Object byte[] 8192
      $read = $stream.Read($buffer, 0, $buffer.Length)

      if ($read -le 0) {
        $client.Close()
        continue
      }

      $requestText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)
      $requestLine = ($requestText -split "`r?`n")[0]
      $parts = $requestLine -split ' '
      $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $filePath = Get-SafeFilePath $requestPath
      $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $contentType = if ($MimeTypes.ContainsKey($extension)) { $MimeTypes[$extension] } else { 'application/octet-stream' }
      $body = [System.IO.File]::ReadAllBytes($filePath)

      Write-HttpResponse $stream 200 'OK' $contentType $body
    } catch {
      $message = [System.Text.Encoding]::UTF8.GetBytes('Server error')
      if ($stream) {
        Write-HttpResponse $stream 500 'Internal Server Error' 'text/plain; charset=utf-8' $message
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
