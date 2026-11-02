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
$script:TeacherToken = [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N')
$localAddresses = @('127.0.0.1', '::1') + @([System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | ForEach-Object { $_.ToString() })

$dataDir = if ($env:MATH_RELAY_DATA_DIR) { $env:MATH_RELAY_DATA_DIR } else { Join-Path $env:USERPROFILE '.math-board' }
[System.IO.Directory]::CreateDirectory($dataDir) | Out-Null
$sha = [System.Security.Cryptography.SHA256]::Create()
$rootHash = ([BitConverter]::ToString($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Root)))).Replace('-', '').Substring(0,16).ToLowerInvariant()
$sha.Dispose()
$dataFile = Join-Path $dataDir ("relay-" + $rootHash + '.json')
if (Test-Path -LiteralPath $dataFile) {
  $saved = Get-Content -LiteralPath $dataFile -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($player in $saved.players) { $script:RemotePlayers[[int]$player.id] = ($player | ConvertTo-Json -Compress -Depth 40) }
  foreach ($record in $saved.records) { $script:RemoteRecords.Add(($record | ConvertTo-Json -Compress -Depth 40)) }
}
function Save-RelayState {
  $body = '{"players":[' + [string]::Join(',', $script:RemotePlayers.Values) + '],"records":[' + [string]::Join(',', $script:RemoteRecords) + ']}'
  [System.IO.File]::WriteAllText(($dataFile + '.tmp'), $body, [System.Text.UTF8Encoding]::new($false))
  if (Test-Path -LiteralPath $dataFile) { [System.IO.File]::Replace(($dataFile + '.tmp'), $dataFile, ($dataFile + '.bak'), $true) } else { [System.IO.File]::Move(($dataFile + '.tmp'), $dataFile) }
}

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
    if ($data -and $data.id -and [long]$data.id -ge 100000 -and [long]$data.id -le 2100000000) { $id = [int]$data.id }
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
    Save-RelayState
    return @{ Status = 200; Json = '{"id":' + $id + '}' }
  }

  if ($Method -eq 'POST' -and $Path -eq '/api/record') {
    if ([string]::IsNullOrWhiteSpace($Body)) {
      return @{ Status = 400; Json = '{"ok":false}' }
    }
    try { $record = $Body | ConvertFrom-Json } catch { return @{ Status = 400; Json = '{"ok":false}' } }
    if (!$record.id -or !$record.playerId) { return @{ Status = 400; Json = '{"ok":false}' } }
    $previous = -1
    for ($i = 0; $i -lt $script:RemoteRecords.Count; $i++) { if (($script:RemoteRecords[$i] | ConvertFrom-Json).id -eq $record.id) { $previous = $i; break } }
    if ($previous -ge 0) { $script:RemoteRecords[$previous] = $Body } else { $script:RemoteRecords.Add($Body) }
    Save-RelayState
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
    Save-RelayState
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

  if (-not $candidate.StartsWith(($rootFull.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar), [System.StringComparison]::OrdinalIgnoreCase)) {
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
    [byte[]]$Body,
    [string]$ExtraHeader = ''
  )

  $header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`n${ExtraHeader}Connection: close`r`n`r`n"
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
      $client.ReceiveTimeout = 15000
      $buffer = New-Object byte[] 16384
      $received = New-Object System.IO.MemoryStream
      $expected = -1
      do {
        $read = $stream.Read($buffer, 0, $buffer.Length)
        if ($read -le 0) { break }
        $received.Write($buffer, 0, $read)
        if ($received.Length -gt 2000000) { throw 'Request too large' }
        $probe = [System.Text.Encoding]::ASCII.GetString($received.ToArray())
        $headerEnd = $probe.IndexOf("`r`n`r`n")
        if ($headerEnd -ge 0) {
          $length = 0
          if ($probe.Substring(0, $headerEnd) -match '(?im)^Content-Length:\s*(\d+)') { $length = [int]$Matches[1] }
          $expected = $headerEnd + 4 + $length
        }
      } while ($expected -lt 0 -or $received.Length -lt $expected)
      if ($expected -lt 0 -or $received.Length -lt $expected) { throw 'Incomplete request' }
      $requestText = [System.Text.Encoding]::UTF8.GetString($received.ToArray())
      $received.Dispose()
      $requestLine = ($requestText -split "`r?`n")[0]
      $parts = $requestLine -split ' '
      $method = if ($parts.Length -ge 1) { $parts[0] } else { 'GET' }
      $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $pathOnly = ($requestPath -split '\?')[0]

      if ($pathOnly.StartsWith('/api/')) {
        $apiBody = Get-RequestBody $requestText
        $peer = $client.Client.RemoteEndPoint.Address.ToString() -replace '^::ffff:', ''
        $fromProxy = $requestText -match '(?im)^(X-Forwarded-For|CF-Connecting-IP|Forwarded):'
        $isTeacherComputer = ($localAddresses -contains $peer) -and !$fromProxy
        $hasTeacherCookie = $requestText -match ("(?im)^Cookie:.*(?:^|[ ;])mathTeacher=" + [regex]::Escape($script:TeacherToken) + "(?:;|\s|$)")
        if ($pathOnly -eq '/api/ping') { $result = @{ Status = 200; Json = '{"ok":true}' } }
        elseif ($pathOnly -eq '/api/session') {
          if ($isTeacherComputer) { $result = @{ Status = 200; Json = '{"ok":true}'; Header = "Set-Cookie: mathTeacher=$($script:TeacherToken); HttpOnly; SameSite=Strict; Path=/api/`r`n" } }
          else { $result = @{ Status = 403; Json = '{"ok":false}' } }
        } elseif (($pathOnly -eq '/api/state' -or $pathOnly -eq '/api/reset') -and (!$isTeacherComputer -or !$hasTeacherCookie)) { $result = @{ Status = 403; Json = '{"ok":false}' } }
        else { $result = Invoke-ApiRequest $method $pathOnly $apiBody }
        if ($null -eq $result) {
          $notFound = [System.Text.Encoding]::UTF8.GetBytes('{"ok":false}')
          Write-HttpResponse $stream 404 'Not Found' 'application/json; charset=utf-8' $notFound
        } else {
          $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes([string]$result.Json)
          Write-HttpResponse $stream $result.Status 'OK' 'application/json; charset=utf-8' $jsonBytes ([string]$result.Header)
        }
      } else {
        $filePath = Get-SafeFilePath $requestPath
        $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $contentType = if ($MimeTypes.ContainsKey($extension)) { $MimeTypes[$extension] } else { 'application/octet-stream' }
        $body = [System.IO.File]::ReadAllBytes($filePath)

        Write-HttpResponse $stream 200 'OK' $contentType $body
      }
    } catch {
      Write-Warning ("Server error: " + $_.Exception.Message)
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
