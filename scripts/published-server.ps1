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

# ── 큐알 학생 폰 ↔ 선생님 화면 ──────────────────────────────────────
# 학생 폰과 선생님 화면은 서로 다른 기기라 브라우저 메모리만으로는
# 답이 선생님 쪽으로 건너가지 않습니다. 이 자리가 그 사이를 잇습니다.
# 문항 하나하나의 속뜻은 몰라도 되므로, 학생 폰이 보낸 답 기록은
# 그대로(문자열째로) 보관했다가 선생님 화면이 물으면 그대로 돌려줍니다.
# 이 창을 닫으면(수업이 끝나면) 함께 사라집니다 — 원래 이 앱은 아무것도
# 저장하지 않으므로, 여기서도 그 성격을 그대로 둡니다.
$script:RemotePlayers = New-Object 'System.Collections.Generic.Dictionary[int,string]'
$script:RemoteRecords = New-Object 'System.Collections.Generic.List[string]'
$script:NextRemotePlayerId = 1001
$MaxRemoteRecords = 5000

function ConvertTo-JsonStringLiteral {
  param([string]$Text)
  # 따옴표·역슬래시·한글을 JSON 문자열 규칙에 맞게 안전히 감싸 줍니다.
  return ($Text | ConvertTo-Json -Compress)
}

function Get-RequestBody {
  param([string]$RequestText)
  $sepIndex = $RequestText.IndexOf("`r`n`r`n")
  if ($sepIndex -lt 0) { return '' }
  return $RequestText.Substring($sepIndex + 4)
}

function Invoke-ApiRequest {
  param(
    [string]$Method,
    [string]$Path,
    [string]$Body
  )

  if ($Method -eq 'POST' -and $Path -eq '/api/join') {
    $data = $null
    try { $data = $Body | ConvertFrom-Json } catch { $data = $null }
    $id = $script:NextRemotePlayerId
    $script:NextRemotePlayerId += 1
    $name = if ($data -and $data.name) { [string]$data.name } else { "$id번 학생" }
    $avatar = if ($data -and $data.avatar) { [string]$data.avatar } else { '🦊' }
    $attendanceNo = $id
    if ($data -and $data.attendanceNo) {
      $parsedNo = 0
      if ([int]::TryParse([string]$data.attendanceNo, [ref]$parsedNo)) { $attendanceNo = $parsedNo }
    }
    $difficulty = '중'
    if ($data -and ($data.difficulty -eq '하' -or $data.difficulty -eq '상')) { $difficulty = [string]$data.difficulty }

    $playerJson = '{"id":' + $id + ',"attendanceNo":' + $attendanceNo + ',"name":' + (ConvertTo-JsonStringLiteral $name) + ',"color":"#7c6bd6","difficulty":' + (ConvertTo-JsonStringLiteral $difficulty) + ',"avatar":' + (ConvertTo-JsonStringLiteral $avatar) + '}'
    $script:RemotePlayers[$id] = $playerJson
    return @{ Status = 200; Json = '{"id":' + $id + '}' }
  }

  if ($Method -eq 'POST' -and $Path -eq '/api/record') {
    if ([string]::IsNullOrWhiteSpace($Body)) {
      return @{ Status = 400; Json = '{"ok":false}' }
    }
    $script:RemoteRecords.Add($Body)
    if ($script:RemoteRecords.Count -gt $MaxRemoteRecords) {
      $script:RemoteRecords.RemoveRange(0, $script:RemoteRecords.Count - $MaxRemoteRecords)
    }
    return @{ Status = 200; Json = '{"ok":true}' }
  }

  if ($Method -eq 'GET' -and $Path -eq '/api/state') {
    $playersJson = [string]::Join(',', $script:RemotePlayers.Values)
    $recordsJson = [string]::Join(',', $script:RemoteRecords)
    return @{ Status = 200; Json = '{"players":[' + $playersJson + '],"records":[' + $recordsJson + ']}' }
  }

  if ($Method -eq 'POST' -and $Path -eq '/api/reset') {
    $script:RemotePlayers.Clear()
    $script:RemoteRecords.Clear()
    return @{ Status = 200; Json = '{"ok":true}' }
  }

  return $null
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
      $buffer = New-Object byte[] 16384
      $read = $stream.Read($buffer, 0, $buffer.Length)

      if ($read -le 0) {
        $client.Close()
        continue
      }

      # UTF-8로 읽어야 학생 이름이나 문제글의 한글이 깨지지 않습니다.
      $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $read)
      $requestLine = ($requestText -split "`r?`n")[0]
      $parts = $requestLine -split ' '
      $method = if ($parts.Length -ge 1) { $parts[0] } else { 'GET' }
      $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $pathOnly = ($requestPath -split '\?')[0]

      if ($pathOnly.StartsWith('/api/')) {
        $apiBody = Get-RequestBody $requestText
        $result = Invoke-ApiRequest $method $pathOnly $apiBody
        if ($null -eq $result) {
          $notFound = [System.Text.Encoding]::UTF8.GetBytes('{"ok":false}')
          Write-HttpResponse $stream 404 'Not Found' 'application/json; charset=utf-8' $notFound
        } else {
          $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes([string]$result.Json)
          Write-HttpResponse $stream $result.Status 'OK' 'application/json; charset=utf-8' $jsonBytes
        }
      } else {
        $filePath = Get-SafeFilePath $requestPath
        $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $contentType = if ($MimeTypes.ContainsKey($extension)) { $MimeTypes[$extension] } else { 'application/octet-stream' }
        $body = [System.IO.File]::ReadAllBytes($filePath)

        Write-HttpResponse $stream 200 'OK' $contentType $body
      }
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
